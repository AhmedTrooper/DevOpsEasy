# DevOpsEasy

> A cross-platform desktop application for Docker image management built with Tauri v2, React, and TypeScript.

<p align="left">
  <img 
  src="https://raw.githubusercontent.com/AhmedTrooper/DevOpsEasy/refs/heads/main/readme_assets/Homepage.png"
       alt="DevOpsEasy Homepage"
       width="600px" />
</p>

<p align="left">
  <img 
  src="https://raw.githubusercontent.com/AhmedTrooper/DevOpsEasy/refs/heads/main/readme_assets/images001.png"
       alt="Docker Images View"
       width="600px" />
</p>

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Core Components](#core-components)
- [State Management](#state-management)
- [Project Structure](#project-structure)
- [Build & Deploy](#build--deploy)
- [Contributing](#contributing)

## ✨ Features

### Docker Management
- **Docker Image Listing**: Real-time fetching and display of Docker images using `docker images` command
- **Image Details**: View comprehensive image information including:
  - Image ID
  - Repository name
  - Tag
  - Size
  - Creation date
  - Digest information

### User Interface
- **Custom Window Controls**: Frameless window with custom minimize, maximize, and close buttons
- **Theme Management**: Dark/Light mode toggle with persistent localStorage storage
- **Responsive Design**: Mobile and desktop-optimized layouts using Tailwind CSS
- **Context Menu**: Right-click context menu for quick navigation
- **Navigation System**: Browser-like forward/back navigation with React Router

### Cross-Platform Support
- **OS Detection**: Automatic platform detection (Windows, Linux, macOS, Android, iOS)
- **Platform-Specific UI**: Conditional rendering based on mobile/desktop platforms
- **Window Management**: Native window controls for desktop platforms

### Application Management
- **Auto-Updates**: Built-in update checker that compares local vs online versions
- **Update Notifications**: Toast notifications for available updates
- **Version Management**: Displays current and available versions
- **Metadata Fetching**: Remote metadata retrieval for update information

## 🏗️ Architecture

### Frontend Stack
- **Tauri v2**: Rust-based desktop framework
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **React Router DOM v7**: Client-side routing

### UI Framework
- **HeroUI**: Modern React component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Feather icons for React
- **Framer Motion**: Animation library

### State Management
- **Zustand**: Lightweight state management solution with the following stores:
  - `ImageStore`: Docker image data management
  - `ThemeStore`: Dark/light mode preferences
  - `ApplicationStore`: App metadata and update management
  - `OsInfoStore`: Platform detection and OS information
  - `ContextMenuStore`: Context menu visibility state

### Backend (Tauri)
- **Rust Backend**: Native system integration
- **Shell Plugin**: Execute Docker commands via `@tauri-apps/plugin-shell`
- **OS Plugin**: Platform detection via `@tauri-apps/plugin-os`
- **Opener Plugin**: External URL handling

## 📋 Prerequisites

### Required Software
- **Docker**: Must be installed and running for Docker management features
- **Node.js**: Version 18 or higher
- **Rust**: Latest stable version
- **Tauri CLI**: For development and building

### System Requirements
- **Windows**: Windows 10 or higher
- **macOS**: macOS 10.15 or higher  
- **Linux**: Modern distributions with X11 or Wayland support

## 🚀 Installation

### Quick Start
```bash
# Clone the repository
git clone https://github.com/AhmedTrooper/DevOpsEasy.git
cd DevOpsEasy

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Build for Production
```bash
# Build the application
npm run tauri build
```

## 🛠️ Development Setup

### Install Required Extensions (VS Code)
- **Rust-analyzer**: Rust language support
- **Tauri**: Tauri-specific development tools
- **ES7+ React/Redux/React-Native snippets**: React development
- **Tailwind CSS IntelliSense**: CSS class completion
- **TypeScript Hero**: TypeScript utilities

### Environment Configuration
```bash
# Install Tauri CLI
cargo install tauri-cli

# Verify Docker installation
docker --version

# Start development environment
npm run dev        # Frontend only
npm run tauri dev  # Full Tauri app
```

## 🧩 Core Components

### Application Shell (`App.tsx`)
- **Theme Management**: Handles dark/light mode switching with localStorage persistence
- **OS Detection**: Automatically detects and adapts to mobile/desktop platforms
- **Context Menu Handler**: Global right-click context menu management
- **Update Checker**: Automatic application update checking on startup

### Docker Image Management (`ImageStore.ts`)
```typescript
// Core Docker functionality
fetchImages: async () => {
  const cmd = Command.create("docker", [
    "images", "--format", 
    "{{.ID}}|{{.Repository}}|{{.Tag}}|{{.Digest}}|{{.Size}}|{{.CreatedSince}}|{{.CreatedAt}}"
  ]);
  const output = await cmd.execute();
  // Parse and store image data
}
```

### Custom Window Controls (`MenuBar.tsx`)
- **Window Dragging**: Custom title bar with drag functionality
- **Window Controls**: Minimize, maximize, close buttons
- **Navigation**: Forward/back browser-like navigation
- **Update Status**: Visual indicator for available updates
- **Theme Toggle**: Integrated dark/light mode switcher

### Routing System (`main.tsx`)
- **React Router Integration**: Client-side routing with nested routes
- **Route Structure**:
  - `/` - Home dashboard with Docker image summary
  - `/images` - Detailed Docker images list
  - `/settings` - Application settings and preferences

## 📊 State Management

### Store Architecture (Zustand)

#### ImageStore
```typescript
interface ImageState {
  images: DockerImage[];
  setImages: (images: DockerImage[]) => void;
  fetchImages: () => Promise<void>;
}
```

#### ThemeStore
```typescript
interface ThemeState {
  dark: boolean;
  setDark: (value: boolean) => void;
  toggleDark: () => void;
}
```

#### ApplicationStore
```typescript
interface ApplicationState {
  menuBarVisible: boolean;
  applicationVersion: string;
  onlineApplicationVersion: string;
  applicationUpdateAvailable: boolean;
  checkApplicationUpdate: () => Promise<void>;
}
```

#### OsInfoStore
```typescript
interface OsInfoState {
  osName: string | null;
  isMobileOS: boolean;
  osFetched: boolean;
  detectMobileOS: () => void;
}
```

## 📁 Project Structure

```
DevOpsEasy/
├── src/                          # React frontend source
│   ├── components/              # Reusable UI components
│   │   ├── contextMenu/         # Right-click context menu
│   │   └── menuBar/            # Custom window title bar
│   │       └── desktop/        # Desktop-specific components
│   ├── constants/              # Application constants
│   │   └── routes/             # Route definitions
│   ├── interface/              # TypeScript type definitions
│   │   ├── routes/             # Route-related types
│   │   ├── store/              # Store interface definitions
│   │   └── types/              # General type definitions
│   ├── routes/                 # Page components
│   │   ├── Home.tsx            # Dashboard page
│   │   ├── Image.tsx           # Docker images page
│   │   └── Settings.tsx        # Settings page
│   ├── store/                  # Zustand state stores
│   │   ├── ApplicationStore.ts # App state management
│   │   ├── ContextMenuStore.ts # Context menu state
│   │   ├── ImageStore.ts       # Docker image state
│   │   ├── osInfoStore.ts      # OS detection state
│   │   └── themeStore.ts       # Theme management
│   └── ui/                     # UI utility components
│       └── ThemeToggleButton.tsx
├── src-tauri/                   # Tauri Rust backend
│   ├── src/                    # Rust source code
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
├── update/                      # Update metadata
│   └── metadata.json           # Version and update info
├── package.json                # Node.js dependencies
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite build configuration
```

## 🎨 UI Components & Styling

### Component Library
- **HeroUI Components**: Cards, Popovers, Switches, Dividers
- **Lucide Icons**: Consistent iconography throughout the app
- **Custom Components**: Theme toggle, navigation, window controls

### Styling System
- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: Complete dark/light theme implementation
- **Responsive Design**: Mobile-first responsive layout
- **Custom Scrollbars**: Platform-specific scrollbar styling

## 🔧 Build & Deploy

### Development Commands
```bash
npm run dev          # Start Vite dev server
npm run tauri dev    # Start Tauri development app
npm run build        # Build frontend for production
npm run tauri build  # Build complete Tauri application
```

### Build Configuration
- **Frontend**: Vite builds React app to `dist/`
- **Backend**: Cargo builds Rust binary
- **Bundle**: Tauri packages everything into platform-specific installers
- **Icons**: Multiple icon formats for different platforms

### Deployment Targets
- **Windows**: `.msi` installer
- **macOS**: `.dmg` and `.app` bundle
- **Linux**: `.deb`, `.rpm`, and `.AppImage`

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code structure
4. Test Docker functionality thoroughly
5. Ensure TypeScript types are properly defined
6. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled, proper type definitions required
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS classes, no inline styles
- **State**: Zustand stores for all state management
- **Error Handling**: Proper try-catch blocks for async operations

### Testing Docker Integration
- Ensure Docker is running before testing
- Test with various Docker image states (empty, populated)
- Verify command execution works across platforms
- Test error handling for Docker command failures

---

**Version**: 0.1.0  
**Author**: [AhmedTrooper](https://github.com/AhmedTrooper)  
**License**: See LICENSE file  
**Repository**: [DevOpsEasy](https://github.com/AhmedTrooper/DevOpsEasy)
