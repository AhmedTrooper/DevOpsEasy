import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { AppShell } from "@astryxdesign/core";
import { ThemeProvider } from "./context/ThemeContext";
import { Sidebar, MobileSidebar } from "./components/Sidebar";
import HomePage from "./features/home/HomePage";
import AboutPage from "./features/about/AboutPage";
import WorkspacesPage from "./features/workspaces/WorkspacesPage";
import DockerPage from "./features/docker/DockerPage";
import ContainerPage from "./features/docker/containers/ContainerPage";
import DraggableTitlebar from "./components/DraggableTitlebar";
import { useUIStore } from "./store/uiStore";
function AppLayout() {
  const { dockPos } = useUIStore();
  
  return (
    <div style={{ backgroundColor: 'var(--color-background-body)', color: 'var(--color-text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppShell
        contentPadding={0} // Remove padding here, add it to Outlet wrapper if needed
        sideNav={<Sidebar />}
        mobileNav={<MobileSidebar />}
      >
        <div className={`flex w-full h-full ${dockPos === 'top' || dockPos === 'bottom' ? 'flex-col' : 'flex-row'}`}>
          {dockPos === 'top' && <DraggableTitlebar />}
          
          <div className="flex-1 overflow-auto p-4">
            <Outlet />
          </div>

          {dockPos === 'right' && <DraggableTitlebar />}
          {dockPos === 'bottom' && <DraggableTitlebar />}
        </div>
      </AppShell>
    </div>
  );
}

// 1. Root Route with AppShell Layout & Responsive Sidebar
const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <AppLayout />
    </ThemeProvider>
  ),
});

// 2. Index / Home Route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// 3. Workspaces Route
const workspacesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workspaces",
  component: WorkspacesPage,
});

// 4. Docker Route (Dashboard)
const dockerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docker",
  component: DockerPage,
});

// 4.1 Docker Containers Route
const dockerContainersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docker/containers",
  component: ContainerPage,
});

// 5. About Route
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

// 6. Route Tree & Router
const routeTree = rootRoute.addChildren([
  indexRoute,
  workspacesRoute,
  dockerRoute,
  dockerContainersRoute,
  aboutRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
