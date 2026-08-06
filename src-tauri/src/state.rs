use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;
use std::process::Command;
use std::sync::{Arc, RwLock};
use std::thread;
use std::time::Duration;
use tauri::{Emitter, Manager};

#[derive(Default, Clone, Serialize, PartialEq)]
pub struct DockerStateData {
    pub containers: Vec<Value>,
    pub images: Vec<Value>,
}

#[derive(Default, Clone, Serialize, PartialEq)]
pub struct GlobalStateData {
    pub docker: DockerStateData,
    // Add AWS, Git, etc. here in the future
}

#[derive(Default)]
pub struct AppState {
    pub data: Arc<RwLock<GlobalStateData>>,
}

#[derive(Clone, Serialize)]
pub struct GlobalStateUpdateEvent {
    pub state: GlobalStateData,
}

pub fn init(app: &mut tauri::App) {
    let state = AppState::default();
    let state_clone = state.data.clone();

    app.manage(state);

    let handle = app.handle().clone();

    thread::spawn(move || loop {
        let mut new_state = GlobalStateData::default();

        // 1. Fetch Docker Containers
        if let Ok(output) = Command::new("docker").args(["ps", "-a", "--format", "{{json .}}"]).output() {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let mut containers = Vec::new();
                for line in stdout.lines() {
                    let line = line.trim();
                    if !line.is_empty() {
                        if let Ok(json_val) = serde_json::from_str::<Value>(line) {
                            containers.push(json_val);
                        }
                    }
                }
                // Sort containers by name
                containers.sort_by(|a, b| {
                    let name_a = a.get("Names").and_then(|n| n.as_str()).unwrap_or("");
                    let name_b = b.get("Names").and_then(|n| n.as_str()).unwrap_or("");
                    name_a.cmp(name_b)
                });
                new_state.docker.containers = containers;
            }
        }

        // 2. Fetch Docker Images
        if let Ok(output) = Command::new("docker").args(["images", "--format", "{{json .}}"]).output() {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let mut images = Vec::new();
                for line in stdout.lines() {
                    let line = line.trim();
                    if !line.is_empty() {
                        if let Ok(json_val) = serde_json::from_str::<Value>(line) {
                            images.push(json_val);
                        }
                    }
                }
                new_state.docker.images = images;
            }
        }

        // Compare and update
        let is_different = if let Ok(mut data) = state_clone.write() {
            if *data != new_state {
                *data = new_state.clone();
                true
            } else {
                false
            }
        } else {
            false
        };

        if is_different {
            let _ = handle.emit(
                "global-state-updated",
                GlobalStateUpdateEvent {
                    state: new_state,
                },
            );
        }

        // Flush every 60 seconds
        thread::sleep(Duration::from_secs(60));
    });
}
