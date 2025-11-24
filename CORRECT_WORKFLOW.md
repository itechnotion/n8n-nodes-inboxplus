# ✅ CORRECT WORKFLOW - How InboxPlus Actually Works

## 🔍 Important Discovery

The `/user-emails/n8n` endpoint does **NOT send emails**. It only **records** that an email was sent.

From API Documentation:
> **Description:** External API for creating email records (requires API key)

This means:
- ❌ InboxPlus does NOT send emails directly
- ✅ InboxPlus RECORDS emails sent via Gmail
- ✅ InboxPlus TRACKS those emails
- ✅ InboxPlus STARTS sequences based on those records

---

## 📧 Correct Workflow Pattern

```
[Trigger]
    ↓
[InboxPlus: Prepare Email]
  - Loads template
  - Generates tracking ID
  - Prepares HTML with tracking
    ↓
[Gmail: Send Message]
  - Actually sends the email
  - Uses prepared HTML from InboxPlus
    ↓
[InboxPlus: Record Sent Email]
  - Records in InboxPlus that email was sent
  - Links Gmail message to InboxPlus tracking
    ↓
[InboxPlus: Start Sequence]
  - Starts automated follow-up sequence
```

---

## 🎯 Three Operations

### 1. Prepare Email
**Purpose:** Load template and generate tracking

**Configuration:**
```
Operation: Prepare Email
Recipient Email: contact@example.com
Template: [Select from dropdown]
```

**Output:**
```json
{
  "success": true,
  "recipientEmail": "contact@example.com",
  "subject": "Email Subject",
  "body": "<div>Email content</div>",
  "gmailBodyHtml": "<div>Email content</div><br><img src='tracking...' />",
  "trackingId": "uuid",
  "trackingImage": "<img src='...' />"
}
```

**Use this for Gmail:**
- To: `{{ $json.recipientEmail }}`
- Subject: `{{ $json.subject }}`
- Body HTML: `{{ $json.gmailBodyHtml }}`

---

### 2. Record Sent Email
**Purpose:** Record in InboxPlus that email was sent via Gmail

**Configuration:**
```
Operation: Record Sent Email
Sender Email: you@example.com
Recipient Email: {{ $json.recipientEmail }}
Subject: {{ $json.subject }}
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.id }}
Tracking ID: {{ $json.trackingId }}
```

**Output:**
```json
{
  "success": true,
  "operation": "recordEmail",
  "recipientEmail": "contact@example.com",
  "senderEmail": "you@example.com",
  "threadId": "gmail-thread-id",
  "messageId": "gmail-message-id",
  "trackingId": "inboxplus-tracking-id"
}
```

---

### 3. Start Sequence
**Purpose:** Start automated follow-up sequence

**Configuration:**
```
Operation: Start Sequence
Sender Email: {{ $json.senderEmail }}
Recipient Email: {{ $json.recipientEmail }}
Sequence: [Select from dropdown]
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.messageId }}
Tracking ID: {{ $json.trackingId }}
Subject: {{ $json.subject }}
```

**Output:**
```json
{
  "success": true,
  "operation": "startSequence",
  "sequenceId": "uuid"
}
```

---

## 📋 Complete Example Workflow

### Node 1: InboxPlus (Prepare Email)
```
Operation: Prepare Email
Recipient Email: contact@example.com
Template: "Welcome Email"
```

### Node 2: Gmail (Send Message)
```
To: {{ $json.recipientEmail }}
Subject: {{ $json.subject }}
Body HTML: {{ $json.gmailBodyHtml }}
```

### Node 3: InboxPlus (Record Sent Email)
```
Operation: Record Sent Email
Sender Email: you@example.com
Recipient Email: {{ $('InboxPlus').item.json.recipientEmail }}
Subject: {{ $('InboxPlus').item.json.subject }}
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.id }}
Tracking ID: {{ $('InboxPlus').item.json.trackingId }}
```

### Node 4: InboxPlus (Start Sequence)
```
Operation: Start Sequence
Sender Email: {{ $json.senderEmail }}
Recipient Email: {{ $json.recipientEmail }}
Sequence: "Onboarding Sequence"
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.messageId }}
Tracking ID: {{ $json.trackingId }}
Subject: {{ $json.subject }}
```

---

## 🔄 Data Flow

### Prepare Email → Gmail
```javascript
{
  recipientEmail: "contact@example.com",
  subject: "Welcome!",
  gmailBodyHtml: "<div>Content</div><br><img tracking />",
  trackingId: "uuid"
}
```

### Gmail → Record Sent Email
```javascript
{
  id: "gmail-message-id",
  threadId: "gmail-thread-id",
  // Plus data from Prepare Email node
}
```

### Record Sent Email → Start Sequence
```javascript
{
  senderEmail: "you@example.com",
  recipientEmail: "contact@example.com",
  threadId: "gmail-thread-id",
  messageId: "gmail-message-id",
  trackingId: "inboxplus-tracking-id",
  subject: "Welcome!"
}
```

---

## ✅ Why This Design?

### InboxPlus Cannot Send Emails
- InboxPlus is a tracking and automation platform
- It doesn't have SMTP capabilities
- It relies on Gmail/Outlook to actually send

### InboxPlus Tracks Gmail Emails
- Records when emails are sent
- Tracks opens/clicks via tracking pixel
- Manages follow-up sequences

### Gmail Does the Sending
- Gmail has the SMTP infrastructure
- Gmail handles delivery
- InboxPlus just tracks it

---

## 🎯 Key Points

1. **Prepare Email** = Load template + generate tracking
2. **Gmail** = Actually send the email
3. **Record Sent Email** = Tell InboxPlus the email was sent
4. **Start Sequence** = Begin automated follow-ups

---

## 🚀 Ready to Use

The node now has the correct three operations:
- ✅ Prepare Email
- ✅ Record Sent Email
- ✅ Start Sequence

Build a workflow with these 4 nodes:
1. InboxPlus (Prepare)
2. Gmail (Send)
3. InboxPlus (Record)
4. InboxPlus (Start Sequence)

This is the correct way to use InboxPlus! 🎉
