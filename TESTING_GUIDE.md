# Testing Guide

## Pre-Testing Checklist

- [x] Build successful
- [x] Linting passed
- [x] TypeScript compilation successful
- [x] No errors or warnings

---

## Installation Testing

### 1. Install in n8n

```bash
cd n8n-nodes-inboxplus
pnpm build
pnpm link --global
```

Then in your n8n installation:
```bash
cd ~/.n8n/custom
npm link n8n-nodes-inboxplus
```

Or restart n8n if using Docker/local installation.

### 2. Verify Node Appears

1. Open n8n
2. Click "Add Node"
3. Search for "InboxPlus"
4. Verify the node appears with correct icon

---

## Credentials Testing

### 1. Add Credentials

1. Go to **Credentials** → **New**
2. Search for "InboxPlus API"
3. Enter your API key: `API_test_123456`
4. Click **Test**
5. Should show: ✅ "Connection successful"

### Expected API Call:
```
POST /auth/get-user-info
Headers: { api_key: "API_test_123456" }
```

### Expected Response:
```json
{
  "code": 200,
  "success": 1,
  "body": {
    "email": "you@example.com",
    "full_name": "Your Name"
  }
}
```

---

## Operation Testing

### Test 1: Send Email Operation

#### Setup
1. Add InboxPlus node
2. Select Operation: **Send Email**
3. Enter Recipient Email: `test@example.com`
4. Select Template from dropdown

#### Expected Behavior
- ✅ Template dropdown loads with templates
- ✅ Templates show correct names
- ✅ Node executes without errors

#### Verify Output
```json
{
  "success": true,
  "operation": "sendEmail",
  "recipientEmail": "test@example.com",
  "senderEmail": "you@example.com",
  "threadId": "uuid",
  "messageId": "uuid",
  "trackingId": "uuid",
  "subject": "Email Subject",
  "body": "Email body content"
}
```

#### Check These Fields
- [ ] `success` is `true`
- [ ] `senderEmail` is populated (not empty)
- [ ] `threadId` is a valid UUID
- [ ] `messageId` is a valid UUID
- [ ] `trackingId` is a valid UUID
- [ ] `subject` matches template
- [ ] `body` matches template

---

### Test 2: Start Sequence Operation

#### Setup
1. Add InboxPlus node after Send Email
2. Select Operation: **Start Sequence**
3. Enter Recipient Email: `test@example.com`
4. Select Sequence from dropdown
5. Map fields from previous node:
   - Thread ID: `{{ $json.threadId }}`
   - Message ID: `{{ $json.messageId }}`
   - Tracking ID: `{{ $json.trackingId }}`
   - Subject: `{{ $json.subject }}`

#### Expected Behavior
- ✅ Sequence dropdown loads with sequences
- ✅ Sequences show correct names
- ✅ Field expressions resolve correctly
- ✅ Node executes without errors

#### Verify Output
```json
{
  "success": true,
  "operation": "startSequence",
  "sequenceId": "uuid",
  "recipientEmail": "test@example.com",
  "senderEmail": "you@example.com",
  "trackingId": "uuid",
  "threadId": "uuid",
  "messageId": "uuid"
}
```

#### Check These Fields
- [ ] `success` is `true`
- [ ] `sequenceId` is populated
- [ ] `senderEmail` is populated
- [ ] All IDs match previous Send Email output

---

## Integration Testing

### Test 3: Full Workflow

#### Workflow Structure
```
[Manual Trigger]
    ↓
[InboxPlus: Send Email]
    ↓
[InboxPlus: Start Sequence]
```

#### Steps
1. Create Manual Trigger
2. Add InboxPlus (Send Email)
   - Recipient: `test@example.com`
   - Template: Select any
3. Add InboxPlus (Start Sequence)
   - Recipient: `test@example.com`
   - Sequence: Select any
   - Map all fields from previous node
4. Execute workflow

#### Expected Result
- ✅ All nodes execute successfully
- ✅ Email is sent
- ✅ Sequence is started
- ✅ No errors in any node

---

## Error Testing

### Test 4: Invalid Credentials

1. Use invalid API key
2. Try to execute node
3. Should show clear error message

**Expected Error:**
```
Could not retrieve sender email from InboxPlus API
```

---

### Test 5: Missing Template

1. Use Send Email operation
2. Don't select a template
3. Try to execute

**Expected Error:**
```
Template not found: [template-id]
```

---

### Test 6: Missing Fields in Start Sequence

1. Use Start Sequence operation
2. Don't map required fields
3. Try to execute

**Expected Error:**
```
Missing required fields. Make sure to connect this to a Send Email operation output.
```

---

## API Testing

### Test 7: Verify API Calls

Use browser DevTools or API monitoring to verify:

#### Send Email Operation Makes These Calls:
1. `POST /auth/get-user-info` - Get sender email
2. `POST /user-emails/n8n/tracking-id` - Generate tracking
3. `POST /user-emails/n8n/get-email-templates` - Get template
4. `POST /user-emails/n8n` - Send email

#### Start Sequence Operation Makes These Calls:
1. `POST /auth/get-user-info` - Get sender email
2. `POST /user-emails/n8n` - Start sequence

---

## Dropdown Testing

### Test 8: Template Dropdown

1. Open Send Email operation
2. Click Template dropdown
3. Verify templates load

**Expected:**
- ✅ Dropdown shows loading state
- ✅ Templates appear after loading
- ✅ Template names are readable
- ✅ Can select a template

---

### Test 9: Sequence Dropdown

1. Open Start Sequence operation
2. Click Sequence dropdown
3. Verify sequences load

**Expected:**
- ✅ Dropdown shows loading state
- ✅ Sequences appear after loading
- ✅ Sequence names are readable
- ✅ Can select a sequence

---

## Expression Testing

### Test 10: Field Mapping

1. Add Send Email node
2. Add Start Sequence node
3. Use expressions in Start Sequence:
   ```
   {{ $json.threadId }}
   {{ $json.messageId }}
   {{ $json.trackingId }}
   {{ $json.subject }}
   ```
4. Execute workflow

**Expected:**
- ✅ Expressions resolve correctly
- ✅ Values are passed from Send Email to Start Sequence
- ✅ No "undefined" or "null" values

---

## Performance Testing

### Test 11: Multiple Recipients

Create workflow that sends to multiple recipients:

```
[Manual Trigger]
    ↓
[Set] (Array of emails)
    ↓
[Loop Over Items]
    ↓
[InboxPlus: Send Email]
    ↓
[InboxPlus: Start Sequence]
```

**Expected:**
- ✅ All emails send successfully
- ✅ All sequences start
- ✅ No rate limiting errors
- ✅ Reasonable execution time

---

## Edge Cases

### Test 12: Empty Email

1. Try to send with empty recipient email
2. Should show validation error

---

### Test 13: Invalid Email Format

1. Try to send with invalid email: `not-an-email`
2. Should show validation error or API error

---

### Test 14: Long Template Content

1. Use template with very long content
2. Verify it sends successfully
3. Check output is not truncated

---

## Regression Testing

### Test 15: Old Workflow Compatibility

If you have old workflows with the 3 separate nodes:

1. Open old workflow
2. Verify old nodes still work (if not removed)
3. Migrate to new node
4. Verify new workflow works

---

## Documentation Testing

### Test 16: README Accuracy

1. Follow README installation steps
2. Verify all commands work
3. Check examples are accurate

---

### Test 17: Example Workflows

1. Try examples from WORKFLOW_EXAMPLES.md
2. Verify they work as described
3. Check all expressions are correct

---

## Final Checklist

### Before Release
- [ ] All tests pass
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Build successful
- [ ] Documentation is accurate
- [ ] Examples work
- [ ] Credentials test works
- [ ] Both operations work
- [ ] Field mapping works
- [ ] Error messages are clear

### After Release
- [ ] Test in production n8n
- [ ] Monitor for errors
- [ ] Collect user feedback
- [ ] Update documentation as needed

---

## Reporting Issues

If you find issues during testing:

1. **Document the issue:**
   - What you did
   - What you expected
   - What actually happened
   - Error messages
   - Screenshots

2. **Check logs:**
   - n8n console logs
   - Browser console
   - Network tab

3. **Contact:**
   - Email: jayg.itechnotion@gmail.com
   - Include all documentation from step 1

---

## Success Criteria

The node is ready for release when:

✅ All tests pass
✅ No critical bugs
✅ Documentation is complete
✅ Examples work
✅ User feedback is positive
✅ Performance is acceptable

---

## Next Steps After Testing

1. Tag release: `git tag v0.2.0`
2. Push to repository
3. Publish to npm (if applicable)
4. Update documentation
5. Announce to users
6. Monitor for issues

---

## Test Results Template

```
Date: ___________
Tester: ___________
Version: 0.2.0

Installation: [ ] Pass [ ] Fail
Credentials: [ ] Pass [ ] Fail
Send Email: [ ] Pass [ ] Fail
Start Sequence: [ ] Pass [ ] Fail
Full Workflow: [ ] Pass [ ] Fail
Error Handling: [ ] Pass [ ] Fail
Dropdowns: [ ] Pass [ ] Fail
Expressions: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________

Overall: [ ] Ready for Release [ ] Needs Work
```
