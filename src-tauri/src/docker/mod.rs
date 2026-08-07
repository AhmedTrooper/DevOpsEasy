//! Docker integration.
//!
//! Submodule layout:
//! - `containers` — lifecycle commands (start, stop, restart, remove).
//! - `images`     — pull/remove with streaming progress and operation state.
//!
//! New docker subcommands belong in their own submodule file (e.g.
//! `networks.rs`, `volumes.rs`, `compose.rs`); re-export them here so the
//! rest of the app continues to address commands as `docker::foo`.

pub mod containers;
pub mod images;
