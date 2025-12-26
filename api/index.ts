/**
 * Vercel Serverless Function Entry Point
 * 
 * This file adapts the Express app for Vercel's serverless environment.
 * Vercel will automatically route requests to this handler.
 */

import dotenv from "dotenv";
// Load .env.local first (development), then .env (production)
dotenv.config({ path: ".env.local" });
dotenv.config();

import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { uploadRouter } from "../server/uploadRouter";
import { handleStripeWebhook } from "../server/stripeWebhook";
import { serveStatic } from "../server/_core/vite";

const app = express();

// Trust proxy for Vercel (SSL termination)
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

// Serve static files in production (Vercel handles this automatically via outputDirectory)
// Only serve static if not on Vercel
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  serveStatic(app);
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;
