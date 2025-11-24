# Migration Guide: Old Nodes → New Unified InboxPlus Node

## Overview

The InboxPlus integration has been consolidated from **3 separate nodes** into **1 unified node** with multiple operations (similar to Gmail node).

---

## What Changed?

### Before (3 Nodes)
1. **InboxPlus Prepare Email** - Loaded template + generated tracking
2. **InboxPlus Send Email** - Sent the email
3. **InboxPlus Start Sequence** - Started follow-up sequence

### After (1 Node)
1. **InboxPlus** with 2 operations:
   - **Send Email** - Sends email with template + tracking
   - **Start Sequence** - Starts follow-up sequence

---

## Key Improvements

✅ **Automatic Sender Email** - No need to manually specify sender email, it's fetched from your InboxPlus account via API

✅ **Cleaner Workflows** - Fewer nodes = simpler workflows

✅ **Better UX** - Operation selector like Gmail node

✅ **Integrated Tracking** - Tracking ID generation is built into Send Email operation

---

## Migration Steps

### Old Workflow Pattern

```
[Trigger]
  ↓
[InboxPlus Prepare Email]
  ↓
[Gmail: Send Message]
  ↓
[InboxPlus Start Sequence]
```

### New Workflow Pattern

```
[Trigger]
  ↓
[InboxPlus: Send Email]
  ↓
[InboxPlus: Start Sequence]
```

---

## Detailed Migration

### 1. Replace "Prepare Email" + "Send Email"

**Old Setup:**
```
Node 1: InboxPlus Prepare Email
- Recipient Email: contact@example.com
- Template: My Template

Node 2: Gmail Send Message
- To: {{ $json.recipientEmail }}
- Subject: {{ $json.subject }}
- Body: {{ $json.gmailBodyHtml }}
```

**New Setup:**
```
Node 1: InboxPlus
- Operation: Send Email
- Recipient Email: contact@example.com
- Template: My Template
```

The new node handles everything - template loading, tracking generation, and sending.

---

### 2. Update "Start Sequence" Node

**Old Setup:**
```
InboxPlus Start Sequence
- Recipient Email: contact@example.com
- Sequence: My Sequence
- Tracking ID: {{ $json.trackingId }}
- (Connected to Gmail output)
```

**New Setup:**
```
InboxPlus
- Operation: Start Sequence
- Recipient Email: contact@example.com
- Sequence: My Sequence
- Thread ID: {{ $json.threadId }}
- Message ID: {{ $json.messageId }}
- Tracking ID: {{ $json.trackingId }}
- Subject: {{ $json.subject }}
```

---

## Field Mapping Reference

### Send Email Operation Output

The new "Send Email" operation outputs:

```json
{
  "success": true,
  "operation": "sendEmail",
  "recipientEmail": "contact@example.com",
  "senderEmail": "you@example.com",
  "templateId": "template-uuid",
  "threadId": "thread-uuid",
  "messageId": "message-uuid",
  "trackingId": "tracking-uuid",
  "trackingImage": "<img src='...' />",
  "subject": "Email Subject",
  "body": "Email body content",
  "apiResponse": { ... }
}
```

### Start Sequence Operation Input

Use these mappings from the previous Send Email output:

| Field | Expression |
|-------|-----------|
| Thread ID | `{{ $json.threadId }}` |
| Message ID | `{{ $json.messageId }}` |
| Tracking ID | `{{ $json.trackingId }}` |
| Subject | `{{ $json.subject }}` |

---

## Benefits of Migration

1. **Fewer Nodes** - 2 nodes instead of 3-4
2. **No Gmail Node Needed** - InboxPlus handles sending
3. **Automatic Sender Email** - Fetched from your account
4. **Simpler Configuration** - Less manual field mapping
5. **Professional Look** - Matches n8n's Gmail node pattern

---

## Troubleshooting

### "Could not retrieve sender email"
- Check your InboxPlus API key is valid
- Ensure your InboxPlus account has an email configured

### "Template not found"
- Refresh the template dropdown
- Check the template exists in your InboxPlus account

### "Sequence not starting"
- Verify all required fields are mapped from Send Email output
- Check the sequence exists and is active in InboxPlus

### "Missing required fields"
- Ensure Start Sequence is connected to Send Email output
- Verify the expressions are correct: `{{ $json.threadId }}`, etc.

---

## Need Help?

Contact: jayg.itechnotion@gmail.com
