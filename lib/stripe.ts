import Stripe from "stripe";

// Initialize Stripe client lazily to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility
export const stripe = {
  get customers() {
    return getStripe().customers;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
};

// Subscription tiers and their features
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "5 custom links",
      "Basic analytics",
      "Standard themes",
      "5 custom themes",
      "xolinks.me branding",
    ],
    limits: {
      maxLinks: 5,
      maxCustomThemes: 5,
      analytics: "7days",
      removeBranding: false,
    },
  },
  pro: {
    name: "Pro",
    price: 5,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited links",
      "Advanced analytics (30 days)",
      "All premium themes",
      "50 custom themes",
      "Remove xolinks.me branding",
      "Priority support",
      "Custom domain (coming soon)",
    ],
    limits: {
      maxLinks: -1, // unlimited
      maxCustomThemes: 50,
      analytics: "30days",
      removeBranding: true,
    },
  },
  business: {
    name: "Business",
    price: 15,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    features: [
      "Unlimited links",
      "Advanced analytics (90 days)",
      "All premium themes",
      "Unlimited custom themes",
      "Remove xolinks.me branding",
      "Custom domain support",
      "Dedicated support",
      "API access",
      "Team collaboration (up to 5 members)",
    ],
    limits: {
      maxLinks: -1, // unlimited
      maxCustomThemes: -1, // unlimited
      analytics: "90days",
      removeBranding: true,
      customDomain: true,
      apiAccess: true,
      teamMembers: 5,
    },
  },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Get tier limits
export function getTierLimits(tier: string) {
  const tierKey = tier as SubscriptionTier;
  return SUBSCRIPTION_TIERS[tierKey]?.limits || SUBSCRIPTION_TIERS.free.limits;
}

// Check if user has access to a feature
export function hasFeatureAccess(
  userTier: string,
  feature: "unlimitedLinks" | "advancedAnalytics" | "removeBranding" | "customDomain" | "apiAccess" | "teamCollaboration"
): boolean {
  const tier = userTier as SubscriptionTier;
  const limits = SUBSCRIPTION_TIERS[tier]?.limits || SUBSCRIPTION_TIERS.free.limits;

  switch (feature) {
    case "unlimitedLinks":
      return limits.maxLinks === -1;
    case "advancedAnalytics":
      return limits.analytics === "30days" || limits.analytics === "90days";
    case "removeBranding":
      return limits.removeBranding;
    case "customDomain":
      return tier === "pro" || tier === "business";
    case "apiAccess":
      return tier === "business";
    case "teamCollaboration":
      return tier === "business";
    default:
      return false;
  }
}
