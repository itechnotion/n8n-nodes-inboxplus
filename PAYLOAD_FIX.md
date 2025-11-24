# Payload Fix - Send Email 500 Error

## ❌ Issue

Send Email was returning:
```json
{
  "code": 500,
  "success": 0,
  "message": "Internal Server Error"
}
```

## 🔍 Root Cause

The payload was missing the `tracking_image` field that the API expects.

## ✅ Fix Applied

### Before (Missing Field):
```javascript
const payload = {
  recipient_email: recipientEmail,
  sender_email: senderEmail,
  subject: template.subject,
  body: template.body,
  threadId,
  message_id: messageId,
  tracking_id: trackingId,
  // ❌ Missing tracking_image
};
```

### After (Complete Payload):
```javascript
const payload = {
  recipient_email: recipientEmail,
  sender_email: senderEmail,
  subject: template.subject,
  body: template.body,
  threadId,
  message_id: messageId,
  tracking_id: trackingId,
  tracking_image: trackingImage,  // ✅ Added
};
```

## 📋 Complete Payload Structure

For `POST /user-emails/n8n` endpoint:

### Send Email (No sequenceId):
```json
{
  "recipient_email": "contact@example.com",
  "sender_email": "you@example.com",
  "subject": "Email Subject",
  "body": "Email body content",
  "threadId": "uuid",
  "message_id": "uuid",
  "tracking_id": "uuid",
  "tracking_image": "<img src='...' />"
}
```

### Start Sequence (With sequenceId):
```json
{
  "recipient_email": "contact@example.com",
  "sender_email": "you@example.com",
  "subject": "Email Subject",
  "threadId": "uuid",
  "message_id": "uuid",
  "tracking_id": "uuid",
  "sequenceId": "uuid"
}
```

## ✅ Status

- [x] Build successful
- [x] Payload structure corrected
- [x] Ready to test again

## 🧪 Test Again

The Send Email operation should now work correctly and return:
```json
{
  "code": 200,
  "success": 1,
  "message": "Command executed successfully"
}
```

Try executing the workflow again!
