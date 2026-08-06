import { useEffect } from "react";
import "./App.css";
import useThemeStore from "./store/themeStore";
import useOsInfoStore from "./store/osInfoStore";
import { useApplicationStore } from "./store/ApplicationStore";
import { useSettingsStore } from "./store/SettingsStore";
import ContextMenuComponent from "./components/contextMenu/ContextMenuComponent";
import ShellLayout from "./features/shell/ShellLayout";

function App() {
  const dark = useThemeStore((state) => state.dark);
  const setDark = useThemeStore((state) => state.setDark);
  const detectOS = useOsInfoStore((state) => state.detectMobileOS);
  const osFetched = useOsInfoStore((state) => state.osFetched);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const checkApplicationUpdate = useApplicationStore(
    (state) => state.checkApplicationUpdate
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDark(true);
    else setDark(true); // Default to dark for high-density IDE feel
  }, [setDark]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (!osFetched) {
      detectOS();
    }
  }, [osFetched]);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    checkApplicationUpdate();
  }, []);

  return (
    <div className="h-screen w-screen bg-zinc-950 text-white overflow-hidden select-none font-sans flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ShellLayout />
      </div>
      <ContextMenuComponent />
    </div>
  );
}

export default App;
