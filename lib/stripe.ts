import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | undefined;

// Route modules are imported during builds. Read server secrets only when
// a request actually needs Stripe, then reuse the client for later requests.
export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is required.");
  }

  stripeClient = new Stripe(secretKey, { typescript: true });
  return stripeClient;
}
