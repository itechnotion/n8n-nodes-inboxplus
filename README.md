# n8n-nodes-inboxplus

A custom **InboxPlus Integration Node for n8n** that allows you to:

* Fetch InboxPlus **email templates**
* Fetch InboxPlus **sequences**
* Generate **tracking IDs**
* Send emails via InboxPlus API
* Trigger sequences — all in a **single unified node**

This node is created and maintained by **Jay Gemawat**.

---

## ✨ Features

✔️ Load templates dynamically
✔️ Load sequences dynamically
✔️ Generate local tracking ID
✔️ Send email using InboxPlus API
✔️ Trigger sequences
✔️ Works with **Gmail → InboxPlus** automation
✔️ Fully compatible with `n8n-node-dev` and community guidelines

---

## 📦 Installation

### **1. Clone this repository**

```
git clone https://github.com/itechnotion-jay/n8n-nodes-inboxplus.git
cd n8n-nodes-inboxplus
```

### **2. Install dependencies**

```
pnpm install
```

### **3. Build the node**

```
pnpm build
```

### **4. Link the node to your local n8n**

```
pnpm link --global
n8n-node-dev link
```

Or manually copy the `/dist` folder into your n8n custom nodes directory.

---

## 🧩 Usage

### **1. Add Credentials**

Go to:
**n8n → Credentials → InboxPlus API**

Enter:

| Field       | Description                    |
| ----------- | ------------------------------ |
| **API Key** | Your InboxPlus account API key |

---

## 🧰 Node Parameters

### **Operation**

* Start InboxPlus Workflow

### **Template Name or ID**

* Auto-loaded from InboxPlus API
* Or specify manually via expression:
  `={{ "template-id-here" }}`

### **Sequence Name or ID**

* Auto-loaded from InboxPlus API

### **Template Variables**

(Optional) — JSON object such as:

```json
{
  "name": "Jay",
  "city": "Valsad"
}
```

---

## 📡 API Endpoints (used internally)

### **Load Templates**

```
POST https://api/for/fetching/template
```

### **Load Sequences**

```
POST https://api/for/fetching/sequences
```

### **Send Email / Trigger Sequence**

```
POST https://api/for/starting/sequences
```

---

## 📘 Example Workflow

**Gmail Trigger → InboxPlus Node → CRM**

When a new email is received:

* Extracts sender email
* Generates tracking ID
* Sends InboxPlus template
* Triggers sequence
* Returns tracking data (ID + image URL)

Output:

```json
{
  "success": true,
  "contactEmail": "example@gmail.com",
  "trackingId": "abc123-xyz",
  "trackingImage": "https://base-url/.../tracking-image/abc123",
  "templateSent": {
    "code": 200,
    "success": 1
  },
  "sequenceTriggered": {
    "code": 200,
    "success": 1
  }
}
```

---

## 🛠 Development

Watch mode:

```
pnpm dev
```

Lint:

```
pnpm lint
pnpm lint:fix
```

Release:

```
pnpm release
```

---

## 🔐 Environment Variables

None required — API Key is stored inside n8n Credentials.

---

## 🤝 Contributing

Pull requests are welcome!

---


---

