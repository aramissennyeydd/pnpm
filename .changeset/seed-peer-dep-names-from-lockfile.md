---
"@pnpm/installing.deps-resolver": patch
"pnpm": patch
---

Fixed non-idempotent lockfile generation caused by incomplete peer dependency name collection during incremental installs. The set of known peer dependency names is now seeded from the existing lockfile, ensuring peer resolution produces stable snapshot keys across repeated installs.
