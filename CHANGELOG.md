# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2025-11-20
### Added
- Auto-fetch of email template body & subject from API.
- Added automatic thread ID and message ID generation.
- Added automatic tracking ID + tracking image generation using `/tracking-id`.
- Added debug-safe sanitization for HTML body (`safeBody`).
- Added sender email placeholder for upcoming org-user lookup.
- Improved error handling and safer fallback values.
- Added strict ESLint/TypeScript compatibility and cleanup.
- Updated dynamic dropdown descriptions to match n8n guidelines.
- Enhanced payload formatting for backend compatibility.

### Changed
- Rebuilt workflow: send template email, attach tracking, and trigger sequence with proper payload.
- Refactored UUID generation and request helper logic.
- Improved credential ping validation.
- Cleaned node metadata (action sentence-case, noDataExpression, corrected display names).

### Fixed
- Fixed issues with template & sequence load options.
- Fixed tracking image extraction from HTML.
- Fixed 403 responses caused by incorrect or missing payload fields.

---

## [0.1.0] - 2025-11-19
### Added
- Initial release of InboxPlus n8n node.
- Credential support (InboxPlus API).
- Dynamic Template & Sequence dropdowns.
- Tracking ID auto-generation.
- Combined workflow: Send template + Trigger sequence.
- Full TypeScript rewrite and code cleanup.
