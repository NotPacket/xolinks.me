import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("No userId in checkout session metadata");
    return;
  }

  // The subscription will be handled by subscription.created event
  console.log(`Checkout completed for user ${userId}`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    // Try to get userId from customer
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    if ("deleted" in customer && customer.deleted) {
      console.error("Customer deleted");
      return;
    }
    const customerUserId = (customer as Stripe.Customer).metadata?.userId;
    if (!customerUserId) {
      console.error("No userId found for subscription");
      return;
    }
    await updateUserSubscription(customerUserId, subscription);
    return;
  }

  await updateUserSubscription(userId, subscription);
}

async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  const tier = subscription.status === "active" ? "pro" : "free";
  const status = subscription.status;

  // Update user's subscription tier
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: status,
    },
  });

  // Get subscription period dates (handle different API versions)
  const subData = subscription as unknown as Record<string, unknown>;
  const currentPeriodStart = subData.current_period_start as number | undefined;
  const currentPeriodEnd = subData.current_period_end as number | undefined;
  const cancelAt = subData.cancel_at as number | null | undefined;
  const canceledAt = subData.canceled_at as number | null | undefined;

  // Upsert subscription record
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status,
      tier,
      currentPeriodStart: currentPeriodStart
        ? new Date(currentPeriodStart * 1000)
        : null,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      cancelAt: cancelAt ? new Date(cancelAt * 1000) : null,
      canceledAt: canceledAt ? new Date(canceledAt * 1000) : null,
    },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id,
      status,
      tier,
      currentPeriodStart: currentPeriodStart
        ? new Date(currentPeriodStart * 1000)
        : null,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
    },
  });

  console.log(`Updated subscription for user ${userId}: ${tier} (${status})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );
    if ("deleted" in customer && customer.deleted) return;
    const customerUserId = (customer as Stripe.Customer).metadata?.userId;
    if (customerUserId) {
      await downgradeUser(customerUserId, subscription.id);
    }
    return;
  }

  await downgradeUser(userId, subscription.id);
}

async function downgradeUser(userId: string, subscriptionId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: "free",
      subscriptionStatus: "canceled",
    },
  });

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: "canceled",
      tier: "free",
    },
  });

  console.log(`Downgraded user ${userId} to free tier`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Get invoice data with flexible access
  const invoiceData = invoice as unknown as Record<string, unknown>;
  const subscriptionId = invoiceData.subscription as string | undefined;
  const amountPaid = invoiceData.amount_paid as number | undefined;
  const paymentIntent = invoiceData.payment_intent as string | undefined;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  // Record payment
  await prisma.payment.create({
    data: {
      userId,
      subscriptionId: (
        await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
          select: { id: true },
        })
      )?.id,
      stripePaymentIntentId: paymentIntent || null,
      amount: amountPaid || 0,
      currency: invoice.currency || "usd",
      status: "succeeded",
    },
  });

  console.log(`Payment succeeded for user ${userId}: ${amountPaid}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Get invoice data with flexible access
  const invoiceData = invoice as unknown as Record<string, unknown>;
  const subscriptionId = invoiceData.subscription as string | undefined;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  // Update user's subscription status
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "past_due",
    },
  });

  console.log(`Payment failed for user ${userId}`);
}
