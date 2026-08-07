//! AWS profile discovery.
//!
//! Reads the well-known `~/.aws/credentials` and `~/.aws/config` files and
//! returns the union of profile names. The frontend is responsible for
//! everything else (selecting one, refreshing tokens, etc.).
//!
//! Cross-platform:
//!   - On Unix, the home directory is `$HOME`.
//!   - On Windows, the home directory is `%USERPROFILE%`.
//!   - On every platform, the AWS CLI accepts a custom `AWS_CONFIG_FILE`
//!     and `AWS_SHARED_CREDENTIALS_FILE`, so we honour those env vars too.

use serde::Serialize;
use std::collections::BTreeSet;
use std::fs;
use std::path::PathBuf;

/// Where we ended up reading each file from (or why we didn't). Returned
/// alongside the profile list so the UI can hint at config-file overrides.
#[derive(Clone, Serialize)]
pub struct ProfileSource {
    pub kind: &'static str,
    pub path: String,
    pub found: bool,
}

/// Result of `aws_list_profiles`. Always populated; never panics.
#[derive(Clone, Serialize)]
pub struct AwsProfiles {
    pub profiles: Vec<String>,
    pub home_dir: Option<String>,
    pub sources: Vec<ProfileSource>,
}

/// One profile entry from an INI file. `aws/config` uses `header = value`
/// shape for `[profile <name>]` (the word `profile` is a literal prefix);
/// `aws/credentials` uses `[<name>]` directly. We normalise both into the
/// same `Vec<String>` shape and dedupe via a `BTreeSet`.
#[derive(Default)]
struct IniFile {
    profiles: BTreeSet<String>,
}

impl IniFile {
    fn parse(text: &str, kind: ProfileKind) -> Self {
        let mut out = IniFile::default();
        for line in text.lines() {
            let trimmed = line.trim_start();
            if !trimmed.starts_with('[') {
                continue;
            }
            // Find the matching `]`. Anything before that on the same line is
            // the section header. We don't worry about comments or continuations
            // because profile names never contain those characters.
            let Some(close) = trimmed.find(']') else {
                continue;
            };
            let header = &trimmed[1..close];
            let profile = match kind {
                ProfileKind::Credentials => header.to_string(),
                ProfileKind::Config => strip_profile_prefix(header),
            };
            if !profile.is_empty() {
                out.profiles.insert(profile);
            }
        }
        out
    }
}

enum ProfileKind {
    Credentials,
    Config,
}

/// `aws/config` uses `[profile name]` for all profiles EXCEPT the default,
/// which is just `[default]`. Strip the `profile ` prefix when present.
fn strip_profile_prefix(header: &str) -> String {
    if let Some(rest) = header.strip_prefix("profile ") {
        rest.trim().to_string()
    } else {
        header.trim().to_string()
    }
}

/// Return the user's home directory in a cross-platform way. Returns `None`
/// if neither `$HOME` nor `%USERPROFILE%` is set, which would be very
/// unusual but is handled gracefully.
fn home_dir() -> Option<PathBuf> {
    if cfg!(windows) {
        std::env::var_os("USERPROFILE").map(PathBuf::from)
    } else {
        std::env::var_os("HOME").map(PathBuf::from)
    }
}

/// Resolve the credentials/config file path. Honour the AWS env var
/// overrides first; fall back to `<home>/.aws/...`.
fn resolve_path(home: Option<&PathBuf>, kind: ProfileKind) -> PathBuf {
    let env_var = match kind {
        ProfileKind::Credentials => "AWS_SHARED_CREDENTIALS_FILE",
        ProfileKind::Config => "AWS_CONFIG_FILE",
    };
    if let Some(p) = std::env::var_os(env_var) {
        let buf = PathBuf::from(p);
        if !buf.as_os_str().is_empty() {
            return buf;
        }
    }
    match home {
        Some(h) => h.join(".aws").join(match kind {
            ProfileKind::Credentials => "credentials",
            ProfileKind::Config => "config",
        }),
        None => PathBuf::new(),
    }
}

/// Read and parse a single AWS INI-style file. Missing files yield an empty
/// profile set (treated as "no profiles from this source"), so the union
/// still surfaces the other file's profiles.
fn read_profiles(path: &PathBuf, kind: ProfileKind) -> BTreeSet<String> {
    if path.as_os_str().is_empty() {
        return BTreeSet::new();
    }
    let Ok(text) = fs::read_to_string(path) else {
        return BTreeSet::new();
    };
    IniFile::parse(&text, kind).profiles
}

/// Tauri command: list every AWS profile visible to the user's CLI config.
/// Returns profile names alphabetically sorted and deduplicated across the
/// `credentials` and `config` files.
#[tauri::command]
pub fn aws_list_profiles() -> AwsProfiles {
    let home = home_dir();
    let creds_path = resolve_path(home.as_ref(), ProfileKind::Credentials);
    let config_path = resolve_path(home.as_ref(), ProfileKind::Config);

    let creds_set = read_profiles(&creds_path, ProfileKind::Credentials);
    let config_set = read_profiles(&config_path, ProfileKind::Config);

    let mut union: BTreeSet<String> = creds_set;
    union.extend(config_set);

    let profiles: Vec<String> = union.into_iter().collect();

    let creds_display = creds_path.display().to_string();
    let config_display = config_path.display().to_string();

    AwsProfiles {
        profiles,
        home_dir: home.as_ref().map(|p| p.display().to_string()),
        sources: vec![
            ProfileSource {
                kind: "credentials",
                path: creds_display,
                found: creds_path.exists(),
            },
            ProfileSource {
                kind: "config",
                path: config_display,
                found: config_path.exists(),
            },
        ],
    }
}
