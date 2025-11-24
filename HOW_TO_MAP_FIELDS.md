# How to Map Fields in Start Sequence Node

## 🎯 The Challenge

The Start Sequence node needs data from TWO different nodes:
1. **Prepare Email node** (InboxPlus) - for recipient, subject, tracking ID
2. **Gmail node** - for thread ID and message ID

## ✅ Solution: Use Node References

In n8n, you can reference ANY previous node by name using expressions.

---

## 📝 Step-by-Step Field Mapping

### 1. Sender Email
**Type manually:**
```
you@example.com
```

### 2. Recipient Email
**From Prepare Email node:**
```javascript
{{ $("InboxPlus").item.json.recipientEmail }}
```
Or if you renamed the first node:
```javascript
{{ $("Prepare Email").item.json.recipientEmail }}
```

### 3. Subject
**From Prepare Email node:**
```javascript
{{ $("InboxPlus").item.json.subject }}
```

### 4. Thread ID
**From Gmail node:**
```javascript
{{ $("Gmail").item.json.threadId }}
```

### 5. Message ID
**From Gmail node:**
```javascript
{{ $("Gmail").item.json.id }}
```

### 6. Tracking ID
**From Prepare Email node:**
```javascript
{{ $("InboxPlus").item.json.trackingId }}
```

### 7. Sequence
**Select from dropdown**

---

## 🏷️ Pro Tip: Rename Your Nodes

To make expressions clearer, rename your nodes:

### Rename First InboxPlus Node:
1. Click on the node
2. Click the node name at the top
3. Rename to: **"Prepare Email"**

### Rename Gmail Node:
1. Click on the node
2. Click the node name at the top
3. Keep as: **"Gmail"** (or rename to something clear)

### Then use these expressions:
```javascript
{{ $("Prepare Email").item.json.recipientEmail }}
{{ $("Prepare Email").item.json.subject }}
{{ $("Prepare Email").item.json.trackingId }}
{{ $("Gmail").item.json.threadId }}
{{ $("Gmail").item.json.id }}
```

---

## 📋 Complete Configuration Example

### Node 1: InboxPlus (Rename to "Prepare Email")
```
Operation: Prepare Email
Recipient Email: contact@example.com
Template: "Welcome Email"
```

### Node 2: Gmail
```
To: {{ $json.recipientEmail }}
Subject: {{ $json.subject }}
Body HTML: {{ $json.gmailBodyHtml }}
```

### Node 3: InboxPlus (Start Sequence)
```
Operation: Start Sequence
Sender Email: you@example.com
Recipient Email: {{ $("Prepare Email").item.json.recipientEmail }}
Subject: {{ $("Prepare Email").item.json.subject }}
Thread ID: {{ $("Gmail").item.json.threadId }}
Message ID: {{ $("Gmail").item.json.id }}
Tracking ID: {{ $("Prepare Email").item.json.trackingId }}
Sequence: "Onboarding Sequence"
```

---

## 🔍 How to Find the Correct Field Names

### Method 1: Check Node Output
1. Execute the Prepare Email node
2. Click on the node
3. Look at the OUTPUT tab
4. See the field names (recipientEmail, subject, trackingId, etc.)

### Method 2: Use Expression Editor
1. Click in any field in Start Sequence
2. Click the "Expression" button
3. Browse available nodes and their outputs
4. Click to insert the expression

---

## ⚠️ Common Mistakes

### ❌ Wrong: Using $json for Previous Nodes
```javascript
{{ $json.recipientEmail }}  // Only works for directly connected node
```

### ✅ Correct: Using Node Name
```javascript
{{ $("Prepare Email").item.json.recipientEmail }}
```

### ❌ Wrong: Wrong Node Name
```javascript
{{ $("InboxPlus1").item.json.recipientEmail }}  // If node is named differently
```

### ✅ Correct: Exact Node Name
```javascript
{{ $("Prepare Email").item.json.recipientEmail }}  // Match exact name
```

---

## 🎯 Quick Reference Table

| Field | Get From | Expression |
|-------|----------|------------|
| Sender Email | Manual input | `you@example.com` |
| Recipient Email | Prepare Email | `{{ $("Prepare Email").item.json.recipientEmail }}` |
| Subject | Prepare Email | `{{ $("Prepare Email").item.json.subject }}` |
| Thread ID | Gmail | `{{ $("Gmail").item.json.threadId }}` |
| Message ID | Gmail | `{{ $("Gmail").item.json.id }}` |
| Tracking ID | Prepare Email | `{{ $("Prepare Email").item.json.trackingId }}` |
| Sequence | Dropdown | Select from list |

---

## 💡 Alternative: Use Set Node

If expressions are confusing, you can use a **Set node** between Gmail and Start Sequence:

### Add Set Node After Gmail:
```
Operation: Set
Mode: Manual Mapping

Fields to Set:
- senderEmail: you@example.com
- recipientEmail: {{ $("Prepare Email").item.json.recipientEmail }}
- subject: {{ $("Prepare Email").item.json.subject }}
- threadId: {{ $json.threadId }}
- messageId: {{ $json.id }}
- trackingId: {{ $("Prepare Email").item.json.trackingId }}
```

### Then in Start Sequence:
```
Sender Email: {{ $json.senderEmail }}
Recipient Email: {{ $json.recipientEmail }}
Subject: {{ $json.subject }}
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.messageId }}
Tracking ID: {{ $json.trackingId }}
```

This way all data comes from the directly connected node!

---

## 🚀 Recommended Approach

**Option 1: Direct References (Simpler)**
- 3 nodes total
- Use node name references
- Requires understanding expressions

**Option 2: With Set Node (Clearer)**
- 4 nodes total
- All data in one place
- Easier to understand and debug

Choose what works best for you! 🎉
