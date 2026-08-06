use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;
use std::process::Command;
use std::sync::{Arc, RwLock};
use std::thread;
use std::time::Duration;
use tauri::{Emitter, Manager};

#[derive(Default)]
pub struct DockerState {
    pub containers: Arc<RwLock<HashMap<String, Value>>>,
}

#[derive(Clone, Serialize)]
pub struct DockerUpdateEvent {
    pub containers: Vec<Value>,
}

pub fn init(app: &mut tauri::App) {
    let state = DockerState::default();
    let containers_clone = state.containers.clone();

    app.manage(state);

    let handle = app.handle().clone();

    thread::spawn(move || loop {
        let output = Command::new("docker")
            .args(["ps", "--format", "{{json .}}"])
            .output();

        if let Ok(output) = output {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let mut new_map = HashMap::new();

                for line in stdout.lines() {
                    let line = line.trim();
                    if line.is_empty() {
                        continue;
                    }
                    if let Ok(json_val) = serde_json::from_str::<Value>(line) {
                        if let Some(id) = json_val.get("ID").and_then(|v| v.as_str()) {
                            new_map.insert(id.to_string(), json_val);
                        }
                    }
                }

                let is_different = if let Ok(mut map) = containers_clone.write() {
                    if *map != new_map {
                        *map = new_map.clone();
                        true
                    } else {
                        false
                    }
                } else {
                    false
                };

                if is_different {
                    let mut sorted_containers: Vec<Value> = new_map.into_values().collect();
                    sorted_containers.sort_by(|a, b| {
                        let name_a = a.get("Names").and_then(|n| n.as_str()).unwrap_or("");
                        let name_b = b.get("Names").and_then(|n| n.as_str()).unwrap_or("");
                        name_a.cmp(name_b)
                    });

                    let _ = handle.emit(
                        "docker-containers-updated",
                        DockerUpdateEvent {
                            containers: sorted_containers,
                        },
                    );
                }
            }
        }

        thread::sleep(Duration::from_millis(500));
    });
}
