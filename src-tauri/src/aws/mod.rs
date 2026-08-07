//! AWS integration.
//!
//! Submodules:
//!   - `profiles` — read-only listing of profiles from `~/.aws/{credentials,config}`
//!
//! New submodules (ec2, s3, iam, lambda) belong in their own files and
//! should be re-exported here so the rest of the app continues to address
//! commands as `aws::foo`.

pub mod profiles;
