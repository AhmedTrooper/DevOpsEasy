//! Git / source-control-management integration.
//!
//! Submodules:
//!   - `repos` — read-only `git status` for a given path
//!
//! New submodules (commits, diffs, branches) belong in their own files and
//! should be re-exported here so the rest of the app continues to address
//! commands as `git::foo`.

pub mod repos;
