# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-01-XX

### 🎉 Major Refactor - Unified Node

#### Added
- **New unified InboxPlus node** with operation selector (like Gmail node)
- **Automatic sender email detection** - Fetches from InboxPlus API `/auth/get-user-info`
- Two operations:
  - **Send Email** - Send emails using InboxPlus templates
  - **Start Sequence** - Start automated follow-up sequences
- Integrated tracking ID generation into Send Email operation
- Better error messages and validation

#### Changed
- Consolidated 3 separate nodes into 1 unified node
- Simplified workflow design (2 nodes instead of 3-4)
- Removed dependency on Gmail node for sending
- Updated package.json to register only the new unified node

#### Deprecated
- `InboxPlusPrepareEmail` node (functionality merged into Send Email operation)
- `InboxPlusSendEmail` node (replaced by Send Email operation)
- `InboxPlusStartSequence` node (replaced by Start Sequence operation)

#### Fixed
- **Sequence not starting** - Fixed API payload structure for starting sequences
- **Missing sender email** - Now automatically fetched from user account
- **Complex workflow** - Reduced from 3-4 nodes to 2 nodes

#### Technical Details
- Sender email is fetched via `POST /auth/get-user-info` API
- Tracking ID generation integrated into Send Email operation
- Thread ID and Message ID are generated as UUIDs
- All metadata properly passed between operations

---

## [0.1.0] - Initial Release

### Added
- InboxPlus Prepare Email node
- InboxPlus Send Email node
- InboxPlus Start Sequence node
- InboxPlus API credentials
- Template and sequence loading from API
