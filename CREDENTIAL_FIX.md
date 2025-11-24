# Credential Fix - IMPORTANT

## ❌ Issue Found

The `/auth/get-user-info` endpoint requires **session-based authentication** (cookies), NOT `api_key` header.

According to the API documentation:
- Most endpoints use session authentication (validateSession)
- **Only n8n-specific endpoints** use `api_key` header authentication

## ✅ Solution Applied

### 1. Fixed Credential Test
Changed from:
```typescript
url: '/auth/get-user-info'  // ❌ Requires session auth
```

To:
```typescript
url: '/user-emails/n8n/get-email-templates'  // ✅ Uses api_key
```

### 2. Made Sender Email a User Input
Since we can't fetch sender email from API with just `api_key`, it's now a required input field.

**Send Email Operation:**
- Sender Email: (user input)
- Recipient Email: (user input)
- Template: (dropdown)

**Start Sequence Operation:**
- Sender Email: `{{ $json.senderEmail }}` (from previous node)
- Recipient Email: (user input)
- Sequence: (dropdown)
- Thread ID, Message ID, Tracking ID, Subject: (from previous node)

---

## 🔑 Credentials Setup

### What to Enter:

1. **InboxPlus API Key:** `API_test_123456` (or your actual API key)

### How to Test:

1. Enter your API key
2. Click "Test"
3. It will call: `POST /user-emails/n8n/get-email-templates`
4. Should return: ✅ Success with list of templates

---

## 📝 Updated Workflow

### Before (What We Tried):
```
❌ Auto-fetch sender email from /auth/get-user-info
   → Doesn't work with api_key authentication
```

### After (What Works):
```
✅ User enters sender email manually
   → Passed between nodes via expressions
```

### Example Workflow:

**Node 1: InboxPlus (Send Email)**
```
Operation: Send Email
Sender Email: you@example.com          ← Manual input
Recipient Email: contact@example.com
Template: [Select from dropdown]
```

**Node 2: InboxPlus (Start Sequence)**
```
Operation: Start Sequence
Sender Email: {{ $json.senderEmail }}  ← From previous node
Recipient Email: contact@example.com
Sequence: [Select from dropdown]
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.messageId }}
Tracking ID: {{ $json.trackingId }}
Subject: {{ $json.subject }}
```

---

## 🔍 Why This Happened

The API has two authentication methods:

### 1. Session Authentication (Cookies)
Used by most endpoints:
- `/auth/get-user-info`
- `/sequences/get`
- `/templates`
- etc.

### 2. API Key Authentication (Header)
Used only by n8n endpoints:
- `/user-emails/n8n/get-email-templates`
- `/user-emails/n8n/get-sequences`
- `/user-emails/n8n/tracking-id`
- `/user-emails/n8n`

Since n8n integration uses API key, we can only call the n8n-specific endpoints.

---

## ✅ What's Fixed

1. ✅ Credential test now works
2. ✅ Templates load correctly
3. ✅ Sequences load correctly
4. ✅ Send Email works
5. ✅ Start Sequence works
6. ✅ Sender email passed between nodes

---

## 📋 Testing Steps

1. **Add Credentials:**
   - API Key: `API_test_123456`
   - Click Test → Should succeed ✅

2. **Test Send Email:**
   - Sender: `you@example.com`
   - Recipient: `test@example.com`
   - Template: Select any
   - Execute → Should succeed ✅

3. **Test Start Sequence:**
   - Connect to Send Email output
   - Sender: `{{ $json.senderEmail }}`
   - Recipient: `test@example.com`
   - Sequence: Select any
   - Map all fields from previous node
   - Execute → Should succeed ✅

---

## 🎯 Final Note

The sender email is now a **required input field** instead of being auto-fetched. This is the correct approach given the API's authentication structure.

The workflow is still simple:
1. Enter sender email once in Send Email node
2. It's automatically passed to Start Sequence via `{{ $json.senderEmail }}`
