# DevOpsEasy

> A powerful desktop app for managing Docker containers, images, volumes, networks, and Compose projects.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)

<p align="center">
  <img 
  src="https://raw.githubusercontent.com/AhmedTrooper/DevOpsEasy/main/readme_assets/Screenshot%20from%202025-11-02%2013-44-19.png"
       alt="DevOpsEasy Dashboard"
       width="800px" />
</p>

## Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/AhmedTrooper/DevOpsEasy/main/readme_assets/Screenshot%20from%202025-11-02%2013-44-27.png" alt="Container Management" width="800px" />
  <br/>
  <em>Container Management</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/AhmedTrooper/DevOpsEasy/main/readme_assets/Screenshot%20from%202025-11-02%2018-40-17.png" alt="Image Management" width="800px" />
  <br/>
  <em>Image Management</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/AhmedTrooper/DevOpsEasy/main/readme_assets/Screenshot%20from%202025-11-02%2018-40-26.png" alt="Volume Management" width="800px" />
  <br/>
  <em>Volume Management</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/AhmedTrooper/DevOpsEasy/main/readme_assets/Screenshot%20from%202025-11-02%2018-40-36.png" alt="Network Management" width="800px" />
  <br/>
  <em>Network Management</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/AhmedTrooper/DevOpsEasy/main/readme_assets/Screenshot%20from%202025-11-02%2019-33-03.png" alt="Docker Compose" width="800px" />
  <br/>
  <em>Docker Compose</em>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/AhmedTrooper/DevOpsEasy/main/readme_assets/Screenshot%20from%202025-11-02%2019-33-13.png" alt="System Information" width="800px" />
  <br/>
  <em>System Information</em>
</p>

## Table of Contents

- [Features](#features)
- [Download](#download)
- [Building from Source](#building-from-source)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

## Features

### Container Management
- Start, stop, restart, pause, and unpause containers
- Create new containers with custom configuration (ports, environment variables, volumes)
- Monitor container stats in real-time (CPU, memory, network, disk I/O)
- View and follow container logs
- Execute commands inside running containers
- Export containers to tar files
- Commit containers to new images
- Full container inspection

### Image Management
- Pull images from Docker Hub or custom registries
- Build images from Dockerfiles using native file picker
- Load images from tar files
- Save images to tar archives
- Tag and untag images
- Delete images
- Create containers directly from images

### Volume Management
- Create and delete Docker volumes
- Inspect volume details and mount points
- Prune unused volumes

### Network Management
- Create custom networks (bridge, host, overlay, macvlan)
- Delete networks
- Inspect network configurations
- Prune unused networks

### Docker Compose
- List and manage Compose projects
- Start projects from custom YAML files
- Stop and remove projects
- View project configurations

### System Information
- View Docker version and system info
- Monitor disk usage by type
- Prune unused resources
- Check container/image statistics

### UI Features
- Dark and light themes
- Custom window controls
- Search and filter functionality
- Confirmation dialogs for destructive actions
- Real-time updates
- Copy Docker commands to clipboard

## Download

**[→ Download from Releases](https://github.com/AhmedTrooper/DevOpsEasy/releases)**

Choose the right package for your system:

- **Windows**: `devopseasy_0.1.0_x64_en-US.msi`
- **Linux (Universal)**: `devopseasy_0.1.0_amd64.AppImage`
- **Linux (Debian/Ubuntu)**: `devopseasy_0.1.0_amd64.deb`
- **Linux (Fedora/RHEL)**: `devopseasy-0.1.0-1.x86_64.rpm`
- **macOS**: `devopseasy_0.1.0_x64.dmg`

## Installation

**Windows**: Run the `.msi` installer.

**Linux (AppImage)**:
```bash
chmod +x devopseasy_0.1.0_amd64.AppImage
./devopseasy_0.1.0_amd64.AppImage
```

**Linux (DEB)**:
```bash
sudo dpkg -i devopseasy_0.1.0_amd64.deb
```

**Linux (RPM)**:
```bash
sudo rpm -i devopseasy-0.1.0-1.x86_64.rpm
```

**macOS**: Open the `.dmg` and drag to Applications.

## Usage

Launch DevOpsEasy and it will connect to your local Docker daemon.

**Quick Tips:**
- Navigate using the sidebar
- Toggle theme in top-right corner
- Search and filter using the search bars
- Enable auto-refresh in Settings

## Building from Source

### Prerequisites

- Node.js 18+
- Rust (latest stable)
- Docker installed

### Linux Dependencies

**Debian/Ubuntu:**
```bash
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

**Fedora:**
```bash
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel
```

**Arch:**
```bash
sudo pacman -S webkit2gtk base-devel curl wget file openssl appmenu-gtk-module gtk3 libappindicator-gtk3 librsvg
```

### Build Steps

```bash
git clone https://github.com/AhmedTrooper/DevOpsEasy.git
cd DevOpsEasy
npm install
npm run tauri dev      # Development
npm run tauri build    # Production
```

Builds are located in `src-tauri/target/release/bundle/`.

## Tech Stack

- **Tauri 2.0** - Desktop app framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **HeroUI** - Component library
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Lucide** - Icons

## How It Works

### Architecture Overview

DevOpsEasy uses Tauri to bridge React frontend with Rust backend. Docker commands are executed via Tauri's shell plugin, and results are parsed and displayed in the UI.

### Docker Command Execution

All Docker operations use Tauri's Command API:

```typescript
// Example: Fetching containers
import { Command } from '@tauri-apps/plugin-shell';

const fetchContainers = async () => {
  const cmd = Command.create('docker', [
    'ps', '-a', '--format',
    '{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}|{{.State}}|{{.CreatedAt}}'
  ]);
  
  const output = await cmd.execute();
  
  if (output.code === 0) {
    const containers = output.stdout.split('\n')
      .filter(Boolean)
      .map(line => {
        const [id, name, image, status, ports, state, createdAt] = line.split('|');
        return { id, name, image, status, ports, state, createdAt };
      });
    return containers;
  }
}
```

### State Management with Zustand

Each Docker resource has its own store:

```typescript
// ContainerStore.ts
import { create } from 'zustand';
import { Command } from '@tauri-apps/plugin-shell';

interface ContainerState {
  containers: Container[];
  loading: boolean;
  error: string | null;
  fetchContainers: () => Promise<void>;
  startContainer: (id: string) => Promise<void>;
  stopContainer: (id: string) => Promise<void>;
}

export const useContainerStore = create<ContainerState>((set, get) => ({
  containers: [],
  loading: false,
  error: null,

  fetchContainers: async () => {
    if (get().loading) return; // Prevent concurrent calls
    
    set({ loading: true, error: null });
    try {
      const cmd = Command.create('docker', ['ps', '-a', '--format', '...']);
      const output = await cmd.execute();
      
      const containers = parseDockerOutput(output.stdout);
      set({ containers });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  startContainer: async (id: string) => {
    const cmd = Command.create('docker', ['start', id]);
    await cmd.execute();
    get().fetchContainers(); // Refresh list
  }
}));
```

### Real-time Container Stats

Streaming stats using Docker's stats API:

```typescript
// Streaming container statistics
const streamStats = async () => {
  const cmd = Command.create('docker', [
    'stats',
    '--no-stream',
    '--format',
    '{{.Container}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}|{{.NetIO}}|{{.BlockIO}}|{{.PIDs}}'
  ]);

  const output = await cmd.execute();
  const stats = output.stdout.split('\n').filter(Boolean).map(line => {
    const [id, cpuPerc, memUsage, memPerc, netIO, blockIO, pids] = line.split('|');
    return { id, cpuPerc, memUsage, memPerc, netIO, blockIO, pids };
  });

  set({ stats });
};
```

### Image Building with Native Dialogs

Using Tauri's dialog plugin for file selection:

```typescript
import { open } from '@tauri-apps/plugin-dialog';
import { Command } from '@tauri-apps/plugin-shell';

const buildImage = async () => {
  // Open native file picker for Dockerfile
  const selected = await open({
    multiple: false,
    directory: false,
    title: 'Select Dockerfile'
  });

  if (selected) {
    const buildPath = selected.path.replace(/\/[^\/]+$/, ''); // Get directory
    
    const cmd = Command.create('docker', [
      'build',
      '-t', imageName,
      '-f', selected.path,
      buildPath
    ]);

    const output = await cmd.execute();
    return output.stdout;
  }
};
```

### Container Creation with Full Configuration

```typescript
const createContainer = async (
  image: string,
  name?: string,
  ports?: string[],
  env?: string[],
  volumes?: string[],
  command?: string
) => {
  const args = ['run', '-d'];
  
  if (name) args.push('--name', name);
  
  ports?.forEach(port => {
    args.push('-p', port);
  });
  
  env?.forEach(variable => {
    args.push('-e', variable);
  });
  
  volumes?.forEach(volume => {
    args.push('-v', volume);
  });
  
  args.push(image);
  
  if (command) {
    args.push(...command.split(' '));
  }

  const cmd = Command.create('docker', args);
  const output = await cmd.execute();
  
  if (output.code === 0) {
    const containerId = output.stdout.trim();
    return containerId;
  }
};
```

### Docker Compose Integration

```typescript
// Start Compose project from custom file
const upProject = async (filePath: string, projectName?: string) => {
  const args = ['compose', '-f', filePath];
  
  if (projectName) {
    args.push('-p', projectName);
  }
  
  args.push('up', '-d');

  const cmd = Command.create('docker', args);
  const output = await cmd.execute();
  
  return output;
};

// List all Compose projects
const fetchProjects = async () => {
  const cmd = Command.create('docker', ['compose', 'ls', '--format', 'json']);
  const output = await cmd.execute();
  
  const projects = JSON.parse(output.stdout);
  return projects;
};
```

### Real-time Log Streaming

```typescript
const streamLogs = async (containerId: string, follow: boolean = true) => {
  const args = ['logs'];
  
  if (follow) {
    args.push('-f'); // Follow mode
  }
  
  args.push('--tail', '100', containerId);

  const cmd = Command.create('docker', args);
  
  if (follow) {
    // Use spawn for streaming
    const child = await cmd.spawn();
    
    child.stdout.on('data', (data) => {
      appendLogs(data);
    });
  } else {
    const output = await cmd.execute();
    return output.stdout;
  }
};
```

### Network Management

```typescript
const createNetwork = async (
  name: string,
  driver: 'bridge' | 'host' | 'overlay' | 'macvlan',
  subnet?: string,
  gateway?: string
) => {
  const args = ['network', 'create', '--driver', driver];
  
  if (subnet) {
    args.push('--subnet', subnet);
  }
  
  if (gateway) {
    args.push('--gateway', gateway);
  }
  
  args.push(name);

  const cmd = Command.create('docker', args);
  await cmd.execute();
};
```

### Volume Operations

```typescript
const createVolume = async (name: string) => {
  const cmd = Command.create('docker', ['volume', 'create', name]);
  await cmd.execute();
};

const inspectVolume = async (name: string) => {
  const cmd = Command.create('docker', ['volume', 'inspect', name, '--format', 'json']);
  const output = await cmd.execute();
  
  const volumeInfo = JSON.parse(output.stdout)[0];
  return {
    name: volumeInfo.Name,
    driver: volumeInfo.Driver,
    mountpoint: volumeInfo.Mountpoint,
    createdAt: volumeInfo.CreatedAt,
    labels: volumeInfo.Labels
  };
};
```

### Custom Window Controls (Frameless Window)

```typescript
// MenuBar.tsx - Custom title bar with window controls
import { getCurrentWindow } from '@tauri-apps/api/window';

const MenuBar = () => {
  const appWindow = getCurrentWindow();

  const minimizeWindow = () => appWindow.minimize();
  const maximizeWindow = () => appWindow.toggleMaximize();
  const closeWindow = () => appWindow.close();

  return (
    <div data-tauri-drag-region className="titlebar">
      <div className="titlebar-buttons">
        <button onClick={minimizeWindow}>−</button>
        <button onClick={maximizeWindow}>□</button>
        <button onClick={closeWindow}>×</button>
      </div>
    </div>
  );
};
```

### Theme Management

```typescript
// ThemeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  dark: boolean;
  toggleDark: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: true,
      toggleDark: () => set((state) => ({ dark: !state.dark }))
    }),
    {
      name: 'theme-storage'
    }
  )
);
```

### Error Handling & Toast Notifications

```typescript
import { addToast } from '@heroui/react';

const handleDockerError = (error: any) => {
  const message = error.stderr || error.message || 'Unknown error';
  
  addToast({
    title: 'Docker Error',
    description: message,
    color: 'danger',
    timeout: 3000
  });
};

// Usage in store
try {
  await cmd.execute();
  addToast({
    title: 'Success',
    description: 'Container started',
    color: 'success',
    timeout: 1000
  });
} catch (error) {
  handleDockerError(error);
}
```

### Debouncing to Prevent Concurrent API Calls

```typescript
const fetchContainers = async () => {
  // Check if already loading
  if (get().loading) return;
  
  set({ loading: true });
  
  try {
    // Fetch data
  } finally {
    set({ loading: false });
  }
};
```

### Clipboard Integration

```typescript
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

const copyDockerCommand = async (command: string) => {
  await writeText(command);
  
  addToast({
    title: 'Copied',
    description: 'Command copied to clipboard',
    color: 'success',
    timeout: 1000
  });
};
```

### File System Operations

```typescript
import { readTextFile } from '@tauri-apps/plugin-fs';

const loadComposeFile = async (path: string) => {
  const content = await readTextFile(path);
  return content;
};
```

## Project Structure

```
DevOpsEasy/
├── src/                    # Frontend code
│   ├── routes/            # Page components
│   ├── store/             # State management
│   ├── components/        # Reusable components
│   └── interface/         # TypeScript types
├── src-tauri/             # Rust backend
│   ├── src/              # Rust source
│   └── capabilities/     # App permissions
└── readme_assets/         # Screenshots
```

## Contributing

Contributions welcome! Open an issue or submit a pull request.

## License

MIT License - see [LICENSE](LICENSE) file.

## Author

**AhmedTrooper** - [@AhmedTrooper](https://github.com/AhmedTrooper)

---

Made with Tauri, React, and TypeScript
