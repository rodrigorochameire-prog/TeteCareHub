import dotenv from "dotenv";
// Load .env.local first (development), then .env (production)
dotenv.config({ path: ".env.local" });
dotenv.config(); // This will load .env and won't override .env.local values

import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { uploadRouter } from "../server/uploadRouter";
import { handleStripeWebhook } from "../server/stripeWebhook";

const app = express();

// Configure Express to trust proxy (for Vercel)
app.set("trust proxy", 1);

// Stripe webhook MUST be registered BEFORE express.json() for signature verification
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Upload routes
app.use("/api", uploadRouter);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export the Express app as a serverless function handler
export default app;
