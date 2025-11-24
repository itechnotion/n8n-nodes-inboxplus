# Workflow Examples

## Example 1: Simple Email + Sequence

### Workflow Structure
```
[Manual Trigger]
    ↓
[InboxPlus: Send Email]
    ↓
[InboxPlus: Start Sequence]
```

### Node Configuration

#### Node 1: Manual Trigger
- Just click "Execute Workflow"

#### Node 2: InboxPlus (Send Email)
```
Operation: Send Email
Recipient Email: contact@example.com
Template: [Select from dropdown]
```

**Output:**
```json
{
  "success": true,
  "recipientEmail": "contact@example.com",
  "senderEmail": "you@example.com",
  "threadId": "abc-123",
  "messageId": "def-456",
  "trackingId": "ghi-789",
  "subject": "Welcome to our platform",
  "body": "<div>Email content...</div>"
}
```

#### Node 3: InboxPlus (Start Sequence)
```
Operation: Start Sequence
Recipient Email: contact@example.com
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
  "sequenceId": "seq-123",
  "recipientEmail": "contact@example.com"
}
```

---

## Example 2: Webhook Trigger + Email Campaign

### Workflow Structure
```
[Webhook]
    ↓
[Set Variables]
    ↓
[InboxPlus: Send Email]
    ↓
[InboxPlus: Start Sequence]
    ↓
[Slack Notification]
```

### Node Configuration

#### Node 1: Webhook
```
HTTP Method: POST
Path: /new-lead
```

**Expected Payload:**
```json
{
  "email": "lead@example.com",
  "name": "John Doe",
  "source": "website"
}
```

#### Node 2: Set Variables
```javascript
return {
  email: $input.item.json.email,
  name: $input.item.json.name,
  source: $input.item.json.source
};
```

#### Node 3: InboxPlus (Send Email)
```
Operation: Send Email
Recipient Email: {{ $json.email }}
Template: "Welcome Email"
```

#### Node 4: InboxPlus (Start Sequence)
```
Operation: Start Sequence
Recipient Email: {{ $json.email }}
Sequence: "Onboarding Sequence"
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.messageId }}
Tracking ID: {{ $json.trackingId }}
Subject: {{ $json.subject }}
```

#### Node 5: Slack Notification
```
Channel: #sales
Message: New lead {{ $('Set Variables').item.json.name }} added to sequence!
```

---

## Example 3: Scheduled Campaign

### Workflow Structure
```
[Schedule Trigger]
    ↓
[Google Sheets: Read Rows]
    ↓
[Loop Over Items]
    ↓
[InboxPlus: Send Email]
    ↓
[InboxPlus: Start Sequence]
    ↓
[Google Sheets: Update Row]
```

### Node Configuration

#### Node 1: Schedule Trigger
```
Trigger Interval: Every Monday at 9:00 AM
```

#### Node 2: Google Sheets (Read Rows)
```
Spreadsheet: "Leads Database"
Sheet: "New Leads"
Range: A2:C100
```

#### Node 3: Loop Over Items
```
Mode: Run Once for Each Item
```

#### Node 4: InboxPlus (Send Email)
```
Operation: Send Email
Recipient Email: {{ $json.email }}
Template: "Weekly Newsletter"
```

#### Node 5: InboxPlus (Start Sequence)
```
Operation: Start Sequence
Recipient Email: {{ $json.email }}
Sequence: "Newsletter Follow-up"
Thread ID: {{ $json.threadId }}
Message ID: {{ $json.messageId }}
Tracking ID: {{ $json.trackingId }}
Subject: {{ $json.subject }}
```

#### Node 6: Google Sheets (Update Row)
```
Operation: Update
Row Number: {{ $json.rowNumber }}
Column: "Status"
Value: "Email Sent"
```

---

## Example 4: Conditional Sequence Based on User Type

### Workflow Structure
```
[Webhook]
    ↓
[Switch]
    ├─ [New Customer] → [InboxPlus: Send Email] → [InboxPlus: Start Sequence "Onboarding"]
    ├─ [Existing Customer] → [InboxPlus: Send Email] → [InboxPlus: Start Sequence "Upsell"]
    └─ [VIP Customer] → [InboxPlus: Send Email] → [InboxPlus: Start Sequence "VIP Care"]
```

### Node Configuration

#### Node 1: Webhook
```
HTTP Method: POST
Path: /customer-action
```

#### Node 2: Switch
```
Mode: Expression
Expression: {{ $json.customerType }}

Routes:
- Route 0: customerType === "new"
- Route 1: customerType === "existing"
- Route 2: customerType === "vip"
```

#### Route 0: New Customer
```
InboxPlus (Send Email):
  Template: "Welcome New Customer"

InboxPlus (Start Sequence):
  Sequence: "Onboarding Sequence"
```

#### Route 1: Existing Customer
```
InboxPlus (Send Email):
  Template: "Product Update"

InboxPlus (Start Sequence):
  Sequence: "Upsell Sequence"
```

#### Route 2: VIP Customer
```
InboxPlus (Send Email):
  Template: "VIP Exclusive Offer"

InboxPlus (Start Sequence):
  Sequence: "VIP Care Sequence"
```

---

## Example 5: Multi-Step Sequence with Delays

### Workflow Structure
```
[Manual Trigger]
    ↓
[InboxPlus: Send Email]
    ↓
[Wait 1 Day]
    ↓
[InboxPlus: Start Sequence]
    ↓
[Wait 3 Days]
    ↓
[Check Response]
    ├─ [No Response] → [Send Reminder]
    └─ [Responded] → [Mark as Engaged]
```

### Node Configuration

#### Node 1: InboxPlus (Send Email)
```
Operation: Send Email
Recipient Email: prospect@example.com
Template: "Initial Outreach"
```

#### Node 2: Wait
```
Amount: 1
Unit: Days
```

#### Node 3: InboxPlus (Start Sequence)
```
Operation: Start Sequence
Sequence: "Follow-up Sequence"
Thread ID: {{ $('InboxPlus').item.json.threadId }}
Message ID: {{ $('InboxPlus').item.json.messageId }}
Tracking ID: {{ $('InboxPlus').item.json.trackingId }}
Subject: {{ $('InboxPlus').item.json.subject }}
```

#### Node 4: Wait
```
Amount: 3
Unit: Days
```

#### Node 5: Check Response
```
Mode: If
Condition: {{ $json.replied === true }}
```

---

## Tips for Building Workflows

### 1. Always Connect Send Email → Start Sequence
The Start Sequence operation needs metadata from Send Email:
- Thread ID
- Message ID
- Tracking ID
- Subject

### 2. Use Expressions for Dynamic Content
```javascript
// Reference previous node
{{ $('InboxPlus').item.json.threadId }}

// Reference input data
{{ $json.email }}

// Use functions
{{ $now.format('YYYY-MM-DD') }}
```

### 3. Error Handling
Add error handling nodes after InboxPlus operations:
```
[InboxPlus] → [IF: Check Success]
    ├─ [Success] → Continue workflow
    └─ [Error] → Send alert / Log error
```

### 4. Testing
- Use Manual Trigger for testing
- Check each node's output before proceeding
- Verify API responses in node output

### 5. Rate Limiting
If sending to multiple recipients:
- Add Wait nodes between sends
- Use Loop node with delay
- Respect InboxPlus API limits

---

## Common Patterns

### Pattern 1: Send + Sequence
```
[InboxPlus: Send Email] → [InboxPlus: Start Sequence]
```

### Pattern 2: Conditional Sending
```
[IF: Check Condition] → [InboxPlus: Send Email] → [InboxPlus: Start Sequence]
```

### Pattern 3: Batch Processing
```
[Get Contacts] → [Loop] → [InboxPlus: Send Email] → [InboxPlus: Start Sequence]
```

### Pattern 4: Webhook → Email
```
[Webhook] → [Transform Data] → [InboxPlus: Send Email] → [InboxPlus: Start Sequence]
```

---

## Debugging Tips

### Check Node Output
Always inspect the output of each node:
```json
{
  "success": true,  // ← Should be true
  "threadId": "...",  // ← Should be present
  "trackingId": "..."  // ← Should be present
}
```

### Verify Expressions
Test expressions in the Expression Editor:
```javascript
// Good
{{ $json.threadId }}

// Bad (missing $json)
{{ threadId }}
```

### Check API Response
Look at `apiResponse` field for errors:
```json
{
  "apiResponse": {
    "code": 200,
    "success": 1,
    "message": "Command executed successfully"
  }
}
```

---

## Need Help?

- Check FIXES.md for common issues
- Review MIGRATION_GUIDE.md for workflow updates
- Contact: jayg.itechnotion@gmail.com
