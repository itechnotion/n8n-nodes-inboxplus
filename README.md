# n8n-nodes-inboxplus

InboxPlus integration for n8n - Send emails with templates and automate follow-up sequences.

## Features

- ✅ Load email templates from InboxPlus
- ✅ Generate tracking pixels for email analytics
- ✅ Send emails via Gmail with InboxPlus templates
- ✅ Start automated follow-up sequences
- ✅ Track email opens and replies
- ✅ Automatic follow-up management

## Installation

```bash
cd n8n-nodes-inboxplus
pnpm install
pnpm build
pnpm link --global
```

Then restart your n8n instance or link in your n8n custom nodes directory.

## Credentials

You need an InboxPlus API key (JWT token) from your InboxPlus account.

1. Go to InboxPlus Profile → Manage API → Generate API
2. Copy your API key
3. In n8n: Credentials → Add → InboxPlus API
4. Paste your API key

## Operations

### 1) Select template

Loads an InboxPlus template and generates tracking.

**Parameters:**
- Recipient Email
- Template (dropdown - loads from your InboxPlus account)

**Output:**
```json
{
  "recipientEmail": "contact@example.com",
  "subject": "Email Subject",
  "body": "<div>Email content</div>",
  "gmailBodyHtml": "<div>Email content</div><br><img tracking />",
  "trackingId": "uuid"
}
```

### 2) Attach Sequence

Records the sent email in InboxPlus and starts automated follow-up sequence.

**Parameters:**
- Sender Email
- Recipient Email
- Subject (from Prepare Email)
- Thread ID (from Gmail)
- Message ID (from Gmail)
- Tracking ID (from Prepare Email)
- Sequence (dropdown - loads from your InboxPlus account)

**Output:**
```json
{
  "success": true,
  "sequenceId": "uuid",
  "recipientEmail": "contact@example.com",
  "apiResponse": { "code": 200, "success": 1 }
}
```

## Workflow Example

```
[Trigger]
    ↓
[InboxPlus: 1) Select template]
  - Recipient: contact@example.com
  - Template: "Welcome Email"
    ↓
[Gmail: Send Message]
  - To: {{ $json.recipientEmail }}
  - Subject: {{ $json.subject }}
  - Body HTML: {{ $json.gmailBodyHtml }}
    ↓
[InboxPlus: 2) Attach Sequence]
  - Sender: you@example.com
  - Recipient: {{ $("InboxPlus").item.json.recipientEmail }}
  - Subject: {{ $("InboxPlus").item.json.subject }}
  - Thread ID: {{ $("Gmail").item.json.threadId }}
  - Message ID: {{ $("Gmail").item.json.id }}
  - Tracking ID: {{ $("InboxPlus").item.json.trackingId }}
  - Sequence: "Onboarding Sequence"
```

## How It Works

1. **1) Select template** - Fetches template from InboxPlus and generates tracking pixel
2. **Gmail** - Sends the email (Day 0) with template content and tracking
3. **2) Attach Sequence** - Records email in InboxPlus and starts automated follow-ups

InboxPlus then:
- Monitors the email thread for replies
- Sends Day 1, Day 2, etc. follow-ups automatically
- Stops sequence if recipient replies
- Tracks opens and clicks

## Field Mapping

### From 1) Select template to Gmail:
- `recipientEmail` → Gmail "To"
- `subject` → Gmail "Subject"
- `gmailBodyHtml` → Gmail "Body HTML"

### From 1) Select template to 2) Attach Sequence:
- `recipientEmail` → "Recipient Email"
- `subject` → "Subject"
- `trackingId` → "Tracking ID"

### From Gmail to 2) Attach Sequence:
- `threadId` → "Thread ID"
- `id` → "Message ID"

## Important Notes

- **Gmail is required** - InboxPlus works WITH Gmail, not as a replacement
- **Day 0 sent by Gmail** - The first email is sent via Gmail node
- **Follow-ups by InboxPlus** - Automated follow-ups are sent by InboxPlus
- **Tracking included** - Tracking pixel is automatically added to emails
- **Reply detection** - InboxPlus monitors for replies and stops sequences

## API Endpoints Used

- `POST /user-emails/n8n/get-email-templates` - Load templates
- `POST /user-emails/n8n/get-sequences` - Load sequences
- `POST /user-emails/n8n/tracking-id` - Generate tracking
- `POST /user-emails/n8n` - Record email and start sequence

## Troubleshooting

### Templates not loading
- Check API key is correct
- Verify templates exist in InboxPlus dashboard

### Sequence not starting
- Ensure all fields are mapped correctly
- Check API response in node output
- Verify sequence exists and is active

### Follow-ups not sending
- Wait for the configured delay (e.g., 24 hours for Day 1)
- Check sequence is active in InboxPlus dashboard
- Verify Gmail is connected in InboxPlus settings

## Version

Current version: 1.2.0

## Author

Avkash Kakdiya
- Email: avkash@itechnotion.com
- Github: https://github.com/itechnotion

## License

MIT
