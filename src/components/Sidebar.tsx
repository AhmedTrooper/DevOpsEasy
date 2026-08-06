import { Link, useLocation } from "@tanstack/react-router";
import { SideNav, SideNavSection, SideNavItem, SideNavHeading, VStack } from "@astryxdesign/core";
import { Home, Info, Boxes, Container, Sun, Moon } from "lucide-react";
import { useAppTheme } from "../context/ThemeContext";

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { mode, toggleMode } = useAppTheme();

  return (
    <SideNav
      header={
        <SideNavHeading
          heading="DevOpsEasy"
          headingHref="/"
          className="px-4 py-3"
        />
      }
    >
      <VStack className="gap-2 px-3 py-2">
        <SideNavSection title="MENU" className="m-2">
          <SideNavItem
            label="Home"
            icon={<Home className="w-4 h-4 m-2" />}
            isSelected={currentPath === "/"}
            as={Link}
            href="/"
            size="md"
          />
          <SideNavItem
            label="Workspaces"
            icon={<Boxes className="w-4 h-4 m-2" />}
            isSelected={currentPath === "/workspaces"}
            as={Link}
            href="/workspaces"
            size="md"
          />
          <SideNavItem
            label="Docker"
            icon={<Container className="w-4 h-4 m-2" />}
            isSelected={currentPath === "/docker"}
            as={Link}
            href="/docker"
            size="md"
          />
          <SideNavItem
            label="About"
            icon={<Info className="w-4 h-4 m-2" />}
            isSelected={currentPath === "/about"}
            as={Link}
            href="/about"
            size="md"
          />
        </SideNavSection>

        <SideNavSection title="THEME" className="m-2">
          <SideNavItem
            label={mode === "dark" ? "Light Mode" : "Dark Mode"}
            icon={mode === "dark" ? <Sun className="w-4 h-4 m-2" /> : <Moon className="w-4 h-4 m-2" />}
            onClick={toggleMode}
            size="md"
          />
        </SideNavSection>
      </VStack>
    </SideNav>
  );
}

export default Sidebar;
