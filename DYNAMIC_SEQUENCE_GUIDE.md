# Dynamic Sequence Behavior Guide

## 🎯 New Feature: Smart Day 0 Handling

The Start Sequence node now has a toggle: **"Sequence Sends Day 0"**

This allows you to handle sequences dynamically based on whether they have `is_first_mail: true` or `false`.

---

## 📋 Two Modes

### Mode 1: Sequence Sends Day 0 (is_first_mail: true)

**Toggle:** ✅ **ON**

**Workflow:**
```
[Prepare Email] → [Start Sequence]
```

**What happens:**
- ✅ InboxPlus sends Day 0 email automatically
- ✅ InboxPlus sends all follow-ups
- ❌ No Gmail node needed

**Required fields:**
- Recipient Email
- Sequence (select from dropdown)

**Use when:**
- Your sequence has Day 0 configured
- You want InboxPlus to send everything
- You don't need custom templates per execution

---

### Mode 2: Gmail Sends Day 0 (is_first_mail: false)

**Toggle:** ❌ **OFF** (default)

**Workflow:**
```
[Prepare Email] → [Gmail] → [Start Sequence]
```

**What happens:**
- ✅ Gmail sends Day 0 using template from Prepare Email
- ✅ InboxPlus records the email
- ✅ InboxPlus sends follow-ups (Day 1+)

**Required fields:**
- Sender Email
- Recipient Email
- Subject (from Prepare Email)
- Thread ID (from Gmail)
- Message ID (from Gmail)
- Tracking ID (from Prepare Email)
- Sequence (select from dropdown)

**Use when:**
- You want to use different templates per execution
- You need custom Day 0 content
- You want n8n to control the first email

---

## 🔄 How to Use

### Scenario A: Sequence with Day 0 Template

If your InboxPlus sequence has Day 0 configured:

1. **Create workflow:**
   ```
   [Trigger] → [InboxPlus: Prepare Email] → [InboxPlus: Start Sequence]
   ```

2. **Configure Start Sequence:**
   - **Sequence Sends Day 0:** ✅ **ON**
   - **Recipient Email:** `contact@example.com`
   - **Sequence:** Select your sequence

3. **Execute:**
   - InboxPlus will send Day 0 automatically
   - Follow-ups will be sent as scheduled

---

### Scenario B: Custom Template per Execution

If you want to use different templates:

1. **Create workflow:**
   ```
   [Trigger] → [InboxPlus: Prepare Email] → [Gmail: Send] → [InboxPlus: Start Sequence]
   ```

2. **Configure Prepare Email:**
   - **Recipient:** `contact@example.com`
   - **Template:** Select template

3. **Configure Gmail:**
   - **To:** `{{ $json.recipientEmail }}`
   - **Subject:** `{{ $json.subject }}`
   - **Body HTML:** `{{ $json.gmailBodyHtml }}`

4. **Configure Start Sequence:**
   - **Sequence Sends Day 0:** ❌ **OFF**
   - **Sender Email:** `you@example.com`
   - **Recipient Email:** `{{ $("InboxPlus").item.json.recipientEmail }}`
   - **Subject:** `{{ $("InboxPlus").item.json.subject }}`
   - **Thread ID:** `{{ $("Gmail").item.json.threadId }}`
   - **Message ID:** `{{ $("Gmail").item.json.id }}`
   - **Tracking ID:** `{{ $("InboxPlus").item.json.trackingId }}`
   - **Sequence:** Select your sequence

5. **Execute:**
   - Gmail sends Day 0 with your template
   - InboxPlus records and sends follow-ups

---

## 📊 Comparison

| Feature | Sequence Sends Day 0 (ON) | Gmail Sends Day 0 (OFF) |
|---------|---------------------------|-------------------------|
| Workflow nodes | 2 nodes | 3 nodes |
| Day 0 sender | InboxPlus | Gmail |
| Template source | Sequence config | n8n Prepare Email |
| Flexibility | Low (fixed template) | High (dynamic template) |
| Required fields | 2 fields | 7 fields |
| Use case | Standard sequences | Custom per-execution |

---

## 🎯 When to Use Each Mode

### Use "Sequence Sends Day 0" (ON) when:
- ✅ Your sequence has a fixed Day 0 template
- ✅ You don't need to change Day 0 content
- ✅ You want simpler workflow
- ✅ You want InboxPlus to handle everything

### Use "Gmail Sends Day 0" (OFF) when:
- ✅ You need different templates per execution
- ✅ You want to personalize Day 0 content
- ✅ You need tracking from the first email
- ✅ You want more control over Day 0

---

## 💡 Pro Tips

### Tip 1: Test Both Modes
Try both modes to see which fits your use case better.

### Tip 2: Check Sequence Configuration
In InboxPlus dashboard, check if your sequence has Day 0 configured before using "Sequence Sends Day 0" mode.

### Tip 3: Use Expressions
When using Gmail mode, use expressions to map fields automatically.

### Tip 4: Monitor Results
Check InboxPlus dashboard to verify emails are being sent correctly.

---

## 🚀 Quick Start

### For Simple Sequences (Fixed Template):
```
1. Toggle "Sequence Sends Day 0" ON
2. Enter recipient email
3. Select sequence
4. Execute
```

### For Dynamic Templates:
```
1. Toggle "Sequence Sends Day 0" OFF
2. Connect Gmail node
3. Map all fields from Prepare Email and Gmail
4. Execute
```

---

## ✅ Summary

The new toggle gives you flexibility:
- **ON** = InboxPlus sends everything (simpler)
- **OFF** = Gmail sends Day 0, InboxPlus follows up (more control)

Choose based on your needs! 🎉
