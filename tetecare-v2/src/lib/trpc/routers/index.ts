import { router } from "../init";
import { authRouter } from "./auth";
import { petsRouter } from "./pets";
import { usersRouter } from "./users";
import { calendarRouter } from "./calendar";
import { statsRouter } from "./stats";
import { bookingsRouter } from "./bookings";
import { notificationsRouter } from "./notifications";
import { creditsRouter } from "./credits";

export const appRouter = router({
  auth: authRouter,
  pets: petsRouter,
  users: usersRouter,
  calendar: calendarRouter,
  stats: statsRouter,
  bookings: bookingsRouter,
  notifications: notificationsRouter,
  credits: creditsRouter,
});

export type AppRouter = typeof appRouter;
