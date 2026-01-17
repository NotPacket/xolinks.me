import { NextRequest, NextResponse } from "next/server";
import { stripe, SUBSCRIPTION_TIERS } from "@/lib/stripe";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const requestedTier = body.tier || "pro";

    // Validate tier
    if (!["pro", "business"].includes(requestedTier)) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        subscriptionTier: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already on requested tier or higher
    const tierHierarchy = ["free", "pro", "business"];
    const currentTierIndex = tierHierarchy.indexOf(user.subscriptionTier);
    const requestedTierIndex = tierHierarchy.indexOf(requestedTier);

    if (currentTierIndex >= requestedTierIndex) {
      return NextResponse.json(
        { error: `You are already on ${user.subscriptionTier} tier or higher` },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Get the price ID for requested tier
    const tierConfig = SUBSCRIPTION_TIERS[requestedTier as keyof typeof SUBSCRIPTION_TIERS];
    const priceId = tierConfig.priceId;

    if (!priceId) {
      console.error(`STRIPE_${requestedTier.toUpperCase()}_PRICE_ID not configured`);
      return NextResponse.json(
        { error: "Subscription configuration error" },
        { status: 500 }
      );
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=subscription`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=true`,
      metadata: {
        userId: user.id,
        tier: requestedTier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: requestedTier,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
