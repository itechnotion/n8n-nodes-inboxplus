# ✅ FINAL WORKFLOW - 2 InboxPlus Nodes + Gmail

## 🎯 Simplified to 3 Nodes Total

```
[InboxPlus: Prepare Email]
    ↓
[Gmail: Send Message]
    ↓
[InboxPlus: Start Sequence]
  (Records email + Starts sequence)
```

---

## 📧 Two Operations

### 1. Prepare Email
**Purpose:** Load template and generate tracking for Gmail

### 2. Start Sequence
**Purpose:** Record sent email AND start automated follow-up sequence (2-in-1!)

---

## 🚀 Complete Workflow Setup

### Node 1: InboxPlus (Prepare Email)

```
Operation: Prepare Email
Recipient Email: contact@example.com
Template: [Select from dropdown]
```

**Output:**
```json
{
  "recipientEmail": "contact@example.com",
  "subject": "Email Subject",
  "body": "<div>Content</div>",
  "gmailBodyHtml": "<div>Content</div><br><img tracking />",
  "trackingId": "uuid"
}
```

---

### Node 2: Gmail (Send Message)

```
To: {{ $json.recipientEmail }}
Subject: {{ $json.subject }}
Body HTML: {{ $json.gmailBodyHtml }}
```

**Output:**
```json
{
  "id": "gmail-message-id",
  "threadId": "gmail-thread-id",
  ...
}
```

---

### Node 3: InboxPlus (Start Sequence)

```
Operation: Start Sequence
Sender Email: you@example.com
Recipient Email: {{ $("Prepare Email").item.json.recipientEmail }}
Subject: {{ $("Prepare Email").item.json.subject }}
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.id }}
Tracking ID: {{ $("Prepare Email").item.json.trackingId }}
Sequence: [Select from dropdown]
```

**What it does:**
1. ✅ Records the email in InboxPlus
2. ✅ Starts the automated sequence

**Output:**
```json
{
  "success": true,
  "sequenceId": "uuid",
  "recipientEmail": "contact@example.com",
  "senderEmail": "you@example.com"
}
```

---

## 📋 Field Mapping Reference

### From Prepare Email Node:
- `recipientEmail` → `{{ $("Prepare Email").item.json.recipientEmail }}`
- `subject` → `{{ $("Prepare Email").item.json.subject }}`
- `trackingId` → `{{ $("Prepare Email").item.json.trackingId }}`
- `gmailBodyHtml` → Use in Gmail node

### From Gmail Node:
- `threadId` → `{{ $json.threadId }}`
- `id` (message ID) → `{{ $json.id }}`

---

## 🎯 Why This Works

### Prepare Email
- Loads InboxPlus template
- Generates tracking pixel
- Prepares HTML for Gmail

### Gmail
- Actually sends the email
- Returns thread ID and message ID

### Start Sequence (2-in-1)
- **First:** Records in InboxPlus that email was sent
- **Then:** Starts the automated follow-up sequence

---

## ✅ Benefits

1. **Only 3 nodes total** (1 less than before)
2. **2 InboxPlus nodes** (Prepare + Start Sequence)
3. **Automatic recording** - No separate "Record Email" node needed
4. **Clean workflow** - Easy to understand and maintain

---

## 🔄 Complete Example

### Workflow:
```
[Manual Trigger]
    ↓
[InboxPlus: Prepare Email]
  Recipient: contact@example.com
  Template: "Welcome Email"
    ↓
[Gmail: Send Message]
  To: {{ $json.recipientEmail }}
  Subject: {{ $json.subject }}
  Body: {{ $json.gmailBodyHtml }}
    ↓
[InboxPlus: Start Sequence]
  Sender: you@example.com
  Recipient: {{ $("Prepare Email").item.json.recipientEmail }}
  Subject: {{ $("Prepare Email").item.json.subject }}
  Thread ID: {{ $json.threadId }}
  Message ID: {{ $json.id }}
  Tracking ID: {{ $("Prepare Email").item.json.trackingId }}
  Sequence: "Onboarding Sequence"
```

---

## 💡 Pro Tips

### Tip 1: Name Your Nodes
Rename "InboxPlus" to "Prepare Email" so expressions work:
```
{{ $("Prepare Email").item.json.recipientEmail }}
```

### Tip 2: Test Step by Step
1. Test Prepare Email first
2. Then add Gmail
3. Finally add Start Sequence

### Tip 3: Check Gmail Output
Make sure Gmail returns `threadId` and `id` fields

### Tip 4: Sender Email
Enter your sender email once in Start Sequence node

---

## 🚀 Ready to Use!

The workflow is now:
- ✅ Simple (3 nodes)
- ✅ Clean (2 InboxPlus operations)
- ✅ Efficient (Start Sequence does 2 things)
- ✅ Professional (Like Gmail node pattern)

Build it and test! 🎉
