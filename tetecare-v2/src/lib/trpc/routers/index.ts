import { router } from "../init";
import { authRouter } from "./auth";
import { petsRouter } from "./pets";

export const appRouter = router({
  auth: authRouter,
  pets: petsRouter,
});

export type AppRouter = typeof appRouter;
