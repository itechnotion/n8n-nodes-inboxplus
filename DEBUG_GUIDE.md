# Debug Guide - Start Sequence

## 🔍 Debug Logs Added

The Start Sequence operation now includes comprehensive debug logging to help identify issues.

---

## 📊 Where to Find Debug Logs

### In n8n:
1. Open your n8n instance terminal/console
2. Execute your workflow
3. Check the console output for debug logs

### Debug Log Format:

```
🔍 START SEQUENCE DEBUG:
Mode: InboxPlus sends Day 0 / Gmail sends Day 0
Recipient: contact@example.com
Sequence ID: uuid
Sender Email: you@example.com
Thread ID: (empty) / thread-id
Message ID: (empty) / message-id
Tracking ID: (empty) / tracking-id
Subject: (only when Gmail sends)

📦 Payload (InboxPlus sends): {
  "recipient_email": "...",
  "sender_email": "...",
  "sequenceId": "..."
}

🚀 Calling API: POST /user-emails/n8n
Headers: { api_key: "***3456" }

✅ API Response: {
  "code": 200,
  "success": 1,
  "message": "..."
}
Success: true
Code: 200
Message: Node executed successfully.
```

---

## 🎯 What to Check

### 1. Mode Detection
```
Mode: InboxPlus sends Day 0
```
- Should match your toggle setting
- ON = "InboxPlus sends Day 0"
- OFF = "Gmail sends Day 0"

### 2. Field Values
```
Sender Email: you@example.com
Recipient: contact@example.com
Sequence ID: uuid
```
- All should have actual values
- No "(empty)" for required fields

### 3. Payload Structure
```json
{
  "recipient_email": "contact@example.com",
  "sender_email": "you@example.com",
  "sequenceId": "uuid"
}
```
- Check field names match API docs
- Check all required fields are present

### 4. API Response
```json
{
  "code": 200,
  "success": 1
}
```
- Code should be 200
- Success should be 1
- If code is 403/500, check payload

---

## 🐛 Common Issues

### Issue 1: Empty Fields
```
Thread ID: (empty)
Message ID: (empty)
```
**When toggle ON:** This is OK
**When toggle OFF:** This is a problem - fields are required

### Issue 2: Wrong Payload
```json
{
  "recipient_email": "...",
  "sender_email": "...",
  "sequenceId": "..."
  // Missing threadId, message_id, tracking_id when Gmail sends
}
```
**Fix:** Make sure toggle is set correctly

### Issue 3: API Error
```json
{
  "code": 403,
  "success": 0
}
```
**Possible causes:**
- Invalid API key
- Missing required fields
- Wrong payload structure

### Issue 4: API Error 500
```json
{
  "code": 500,
  "success": 0,
  "message": "Internal Server Error"
}
```
**Possible causes:**
- Sequence doesn't exist
- Invalid sequence ID
- Backend issue

---

## 📝 Testing Steps

### Test 1: InboxPlus Sends Day 0 (Toggle ON)

1. **Set toggle ON**
2. **Fill fields:**
   - Sender: `you@example.com`
   - Recipient: `contact@example.com`
   - Sequence: Select from dropdown
3. **Execute**
4. **Check logs:**
   ```
   Mode: InboxPlus sends Day 0
   Payload: {
     "recipient_email": "contact@example.com",
     "sender_email": "you@example.com",
     "sequenceId": "uuid"
   }
   ```
5. **Expected result:**
   - Code: 200
   - Success: 1
   - Day 0 email sent by InboxPlus

---

### Test 2: Gmail Sends Day 0 (Toggle OFF)

1. **Set toggle OFF**
2. **Fill all fields:**
   - Sender: `you@example.com`
   - Recipient: From Prepare Email
   - Subject: From Prepare Email
   - Thread ID: From Gmail
   - Message ID: From Gmail
   - Tracking ID: From Prepare Email
   - Sequence: Select from dropdown
3. **Execute**
4. **Check logs:**
   ```
   Mode: Gmail sends Day 0
   Payload: {
     "recipient_email": "...",
     "sender_email": "...",
     "subject": "...",
     "threadId": "...",
     "message_id": "...",
     "tracking_id": "...",
     "sequenceId": "..."
   }
   ```
5. **Expected result:**
   - Code: 200
   - Success: 1
   - Sequence started, follow-ups scheduled

---

## 🔧 Troubleshooting

### If Day 0 Not Sending (Toggle ON):

1. **Check debug logs:**
   - Is mode correct?
   - Is payload minimal (only 3 fields)?
   - Is API response 200?

2. **Check InboxPlus dashboard:**
   - Go to Sequences → Your Sequence
   - Check Recipients tab
   - Look for the recipient email
   - Check "is_first_mail_send" status

3. **Check sequence configuration:**
   - Is `is_first_mail: true` in sequence?
   - Is Day 0 configured in sequence?
   - Is sequence active?

4. **Check recipient's inbox:**
   - Did they receive Day 0 email?
   - Check spam folder
   - Check sent time in InboxPlus

---

### If Follow-ups Not Sending:

1. **Check sequence status:**
   - Is sequence active?
   - Are follow-ups scheduled?
   - Check "Schedule" tab in InboxPlus

2. **Check time delays:**
   - Day 1 = 24 hours after Day 0
   - Have you waited long enough?

3. **Check for replies:**
   - If recipient replied, sequence stops
   - Check "is_reply_received" in InboxPlus

---

## 📤 Reporting Issues

When reporting issues, include:

1. **Debug logs** (copy from console)
2. **Node configuration** (screenshot)
3. **Toggle setting** (ON or OFF)
4. **API response** (from debug logs)
5. **Expected behavior**
6. **Actual behavior**

Send to: jayg.itechnotion@gmail.com

---

## ✅ Success Indicators

### When Everything Works:

```
🔍 START SEQUENCE DEBUG:
Mode: InboxPlus sends Day 0
Recipient: contact@example.com
Sequence ID: 06f1e06e-d742-4f18-826c-5e57dccdffca
Sender Email: you@example.com
Thread ID: (empty)
Message ID: (empty)
Tracking ID: (empty)

📦 Payload (InboxPlus sends): {
  "recipient_email": "contact@example.com",
  "sender_email": "you@example.com",
  "sequenceId": "06f1e06e-d742-4f18-826c-5e57dccdffca"
}

🚀 Calling API: POST /user-emails/n8n
Headers: { api_key: "***3456" }

✅ API Response: {
  "code": 200,
  "success": 1,
  "message": "Node executed successfully."
}
Success: true
Code: 200
```

**Then check InboxPlus dashboard to confirm Day 0 was sent!**
