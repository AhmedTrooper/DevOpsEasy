# DevOpsEasy - Progress Tracker

## Global Architecture
- [x] Integrate Rust Tauri backend with Vite + React + TypeScript
- [x] Configure `@astryxdesign/core` components and tokens
- [x] Implement `GlobalState` engine in Rust for polling backend tools
- [x] Configure 60-second polling interval for `global-state-updated` events
- [x] Move to Frameless UI (`decorations: false`) with custom Draggable Titlebar

## Docker Features
- [x] Connect `docker ps -a` and `docker images` to GlobalState
- [x] Docker Dashboard Page routing
- [x] Live Containers Table with Auto-Refresh & Sorting
- [ ] Container Lifecycle Actions (Start, Stop, Restart)
- [ ] Images Management Table
- [ ] Network Management
- [ ] Volume Management
- [ ] Docker Compose features

## UI/UX Enhancements
- [x] Create Custom Draggable Titlebar with Window Controls (Minimize, Maximize, Close)
- [x] Integrate Framer Motion for draggable widgets
- [x] Sidebar navigation with Collapsible state
- [x] Migrate to strict component-based layouts (Astryx rules)
- [ ] Add loading skeletons for data fetching

## Future Integrations
- [ ] AWS Tooling
- [ ] Git / Source Control Management
