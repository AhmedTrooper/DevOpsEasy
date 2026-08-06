import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import HomePage from "./features/home/HomePage";

// 1. Root Route
const rootRoute = createRootRoute({
  component: () => <HomePage />,
});

// 2. Index Route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// 3. Route Tree & Router
const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
