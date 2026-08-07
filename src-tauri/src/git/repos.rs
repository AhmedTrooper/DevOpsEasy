//! Git repository discovery and status.
//!
//! Owns read-only commands that the frontend drives through `invoke`. Each
//! command is short-lived (no worker threads, no shared state yet) because
//! `git status --porcelain` returns within milliseconds for normal repos.
//!
//! Cross-platform: every path is accepted as a `String` and converted to a
//! `PathBuf` at the boundary; we never assume the OS-specific separator.

use serde::Serialize;
use std::path::PathBuf;
use std::process::Command;

/// One line of `git status --porcelain=v1`, normalized for the UI.
///
/// `porcelain` mode prints exactly two characters of status code followed by
/// a space and the path. Stash the original code so the UI can render the
/// precise kind without re-parsing.
#[derive(Clone, Serialize)]
pub struct StatusEntry {
    pub code: String,
    pub path: String,
}

/// Result of a `git status` invocation. Always populated so the frontend
/// can render a stable shape even on confusing edge cases (empty repo,
/// detached HEAD, etc.).
#[derive(Clone, Serialize)]
pub struct RepoStatus {
    pub path: String,
    pub branch: Option<String>,
    pub is_clean: bool,
    pub entries: Vec<StatusEntry>,
    pub error: Option<String>,
}

/// Resolve `git` similarly to how `docker_command` does: probe a few
/// well-known absolute paths before falling back to PATH lookup. Returning
/// a `Command` keeps the call site uniform.
fn git_command() -> Command {
    let primary = if cfg!(windows) { "git.exe" } else { "git" };

    let fallback_paths: &[&str] = if cfg!(windows) {
        &[
            r"C:\Program Files\Git\bin\git.exe",
            r"C:\Program Files (x86)\Git\bin\git.exe",
        ]
    } else if cfg!(target_os = "macos") {
        &[
            "/usr/bin/git",
            "/usr/local/bin/git",
            "/opt/homebrew/bin/git",
            "/Applications/Xcode.app/Contents/Developer/usr/bin/git",
        ]
    } else {
        &["/usr/bin/git", "/usr/local/bin/git", "/snap/bin/git"]
    };

    for path_str in fallback_paths {
        let p = PathBuf::from(path_str);
        if p.exists() {
            return Command::new(p);
        }
    }

    Command::new(primary)
}

/// Run `git status --porcelain` for the given repository path and return a
/// structured `RepoStatus`. Never panics: any failure (missing binary,
/// non-git dir, permission denied) surfaces as `error` on the returned
/// struct so the UI can show a useful message instead of crashing.
#[tauri::command]
pub fn git_status(path: String) -> RepoStatus {
    let mut status = RepoStatus {
        path: path.clone(),
        branch: None,
        is_clean: true,
        entries: Vec::new(),
        error: None,
    };

    // `--no-optional-locks` so we don't trigger background index updates that
    // would slow down the call and surprise the user.
    let output = git_command()
        .args([
            "-C",
            &path,
            "status",
            "--porcelain",
            "--branch",
            "--no-optional-locks",
        ])
        .output();

    let output = match output {
        Ok(o) => o,
        Err(e) => {
            status.error = Some(format!("Failed to run git: {}", e));
            return status;
        }
    };

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        status.error = if stderr.is_empty() {
            Some(format!("git exited with status {}", output.status))
        } else {
            Some(stderr)
        };
        return status;
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        let trimmed = line.trim_end();
        if trimmed.is_empty() {
            continue;
        }

        // Branch line: `## <ref>` or `## <ref>...<upstream>` or `## HEAD (no branch)`.
        if let Some(rest) = trimmed.strip_prefix("##") {
            let rest = rest.trim_start();
            // The first space-separated token is the branch name (or `HEAD`).
            if let Some(branch) = rest.split_whitespace().next() {
                status.branch = Some(branch.to_string());
            }
            continue;
        }

        // Regular porcelain line: exactly two status chars, a space, then path.
        // We require at least 3 chars and the 3rd must be a space — this is
        // what porcelain guarantees, so a length check is sufficient.
        let bytes = trimmed.as_bytes();
        if bytes.len() < 3 || bytes[2] != b' ' {
            // Malformed line — stash as a generic entry so the user sees it.
            status.entries.push(StatusEntry {
                code: "??".to_string(),
                path: trimmed.to_string(),
            });
            status.is_clean = false;
            continue;
        }

        let code = trimmed[..2].to_string();
        let file_path = trimmed[3..].to_string();
        status.entries.push(StatusEntry {
            code,
            path: file_path,
        });
        status.is_clean = false;
    }

    status
}
