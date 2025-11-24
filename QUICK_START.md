# Quick Start Guide

## ✅ Everything is Fixed and Ready!

### 🔑 Step 1: Add Credentials

1. Open n8n
2. Go to **Credentials** → **Add Credential**
3. Search for **"InboxPlus API"**
4. Enter your API Key: `API_test_123456` (or your actual key)
5. Click **"Test"** → Should show ✅ Success!

**What it tests:**
```
POST https://dev-api.inboxpl.us/user-emails/n8n/get-email-templates
Header: api_key: YOUR_KEY
```

---

## 📧 Step 2: Send Email

### Add InboxPlus Node
1. Click **"Add Node"**
2. Search **"InboxPlus"**
3. Select the node

### Configure Send Email
```
Operation: Send Email
Sender Email: you@example.com
Recipient Email: contact@example.com
Template: [Select from dropdown - loads your templates]
```

### What it does:
1. Generates tracking ID via: `POST /user-emails/n8n/tracking-id`
2. Fetches template via: `POST /user-emails/n8n/get-email-templates`
3. Sends email via: `POST /user-emails/n8n`

### Output:
```json
{
  "success": true,
  "senderEmail": "you@example.com",
  "recipientEmail": "contact@example.com",
  "threadId": "uuid",
  "messageId": "uuid",
  "trackingId": "uuid",
  "subject": "Email Subject",
  "body": "Email body"
}
```

---

## 🔄 Step 3: Start Sequence

### Add Another InboxPlus Node
Connect it after the Send Email node

### Configure Start Sequence
```
Operation: Start Sequence
Sender Email: {{ $json.senderEmail }}
Recipient Email: contact@example.com
Sequence: [Select from dropdown - loads your sequences]
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.messageId }}
Tracking ID: {{ $json.trackingId }}
Subject: {{ $json.subject }}
```

### What it does:
Starts sequence via: `POST /user-emails/n8n`

### Output:
```json
{
  "success": true,
  "operation": "startSequence",
  "sequenceId": "uuid",
  "recipientEmail": "contact@example.com",
  "senderEmail": "you@example.com"
}
```

---

## 🎯 Complete Workflow Example

```
[Manual Trigger]
    ↓
[InboxPlus: Send Email]
  Operation: Send Email
  Sender: you@example.com
  Recipient: contact@example.com
  Template: "Welcome Email"
    ↓
[InboxPlus: Start Sequence]
  Operation: Start Sequence
  Sender: {{ $json.senderEmail }}
  Recipient: contact@example.com
  Sequence: "Onboarding Sequence"
  Thread ID: {{ $json.threadId }}
  Message ID: {{ $json.messageId }}
  Tracking ID: {{ $json.trackingId }}
  Subject: {{ $json.subject }}
```

---

## 🔍 API Endpoints Used

All endpoints use `api_key` header authentication:

### 1. Get Templates (for dropdown)
```
POST https://dev-api.inboxpl.us/user-emails/n8n/get-email-templates
Header: api_key: YOUR_KEY
```

### 2. Get Sequences (for dropdown)
```
POST https://dev-api.inboxpl.us/user-emails/n8n/get-sequences
Header: api_key: YOUR_KEY
```

### 3. Generate Tracking ID
```
POST https://dev-api.inboxpl.us/user-emails/n8n/tracking-id
Header: api_key: YOUR_KEY
```

### 4. Send Email / Start Sequence
```
POST https://dev-api.inboxpl.us/user-emails/n8n
Header: api_key: YOUR_KEY
Body: {
  "sender_email": "you@example.com",
  "recipient_email": "contact@example.com",
  "subject": "Subject",
  "body": "Content",
  "threadId": "uuid",
  "message_id": "uuid",
  "tracking_id": "uuid",
  "sequenceId": "uuid"  // Only for Start Sequence
}
```

---

## ✅ Checklist

- [x] Build successful
- [x] Credentials test works
- [x] Templates load in dropdown
- [x] Sequences load in dropdown
- [x] Send Email operation ready
- [x] Start Sequence operation ready
- [x] All API endpoints correct

---

## 🚀 You're Ready!

1. **Add credentials** with your API key
2. **Create workflow** with Send Email → Start Sequence
3. **Execute** and watch it work!

The sequence will now start correctly because:
- ✅ Correct API endpoints
- ✅ Correct authentication (api_key header)
- ✅ Proper payload structure
- ✅ All required fields included

---

## 💡 Pro Tips

### Tip 1: Reuse Sender Email
Set sender email once in Send Email, it automatically passes to Start Sequence via `{{ $json.senderEmail }}`

### Tip 2: Test with Manual Trigger
Use Manual Trigger for testing before connecting to webhooks or schedules

### Tip 3: Check Node Output
Always check the output of Send Email to verify all fields are present before connecting to Start Sequence

### Tip 4: Use Expressions
All fields in Start Sequence have default expressions that map from Send Email output

---

## 🆘 Troubleshooting

### Credential Test Fails
- Check API key is correct
- Verify you're using the n8n API key (not session token)

### Templates Don't Load
- Check credentials are saved
- Verify API key has access to templates

### Sequence Doesn't Start
- Verify all fields are mapped from Send Email
- Check threadId, messageId, trackingId are not empty
- Ensure sender email is correct

---

## 📞 Need Help?

Contact: jayg.itechnotion@gmail.com

---

**Everything is ready to go! Test it now! 🎉**
