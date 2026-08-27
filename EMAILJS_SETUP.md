# EmailJS Setup Instructions

The feedback form uses EmailJS to send emails. Follow these steps to set it up:

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account (200 emails/month free)
3. Verify your email address

## Step 2: Add Email Service
1. Go to "Email Services" in the dashboard
2. Click "Add New Service"
3. Select Gmail (or your preferred email provider)
4. Connect your Gmail account: **support@vamsapattika.com**
5. Copy the **Service ID** (something like `service_xxxxxx`)
#### service_m9f0av3

## Step 3: Create Email Template
1. Go to "Email Templates" in the dashboard
2. Click "Create New Template"
3. Use this template:

### Template Content:
```
Subject: New Feedback from {{user_name}} - {{rating}}

From: {{user_name}}
Email: {{user_email}}
Rating: {{rating}}

Feedback:
{{feedback}}

---
This email was sent from Family Tree App
```

### Template Variables:
- `user_name`
- `user_email`
- `rating`
- `feedback`

4. Copy the **Template ID** (something like `template_xxxxxx`)
#### template_i6e0vwy

## Step 4: Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key** (something like `xxxxxxxxxxxxxx`)
#### l0b9AbBdPsRpHvZXu

## Step 5: Update the Code
Open `src/components/FeedbackModal.jsx` and replace these lines (around line 35):

```javascript
const SERVICE_ID = 'YOUR_SERVICE_ID';      // Replace with your Service ID
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';    // Replace with your Template ID  
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';      // Replace with your Public Key
```

Example:
```javascript
const SERVICE_ID = 'service_abc123';
const TEMPLATE_ID = 'template_xyz789';
const PUBLIC_KEY = 'xxxxxxxxxxx';
```

## Step 6: Test
1. Refresh your app
2. Export a tree (PNG, PDF, or Print)
3. Fill out the feedback form
4. Submit
5. Check your email at **support@vamsapattika.com**

## Troubleshooting
- Make sure your Gmail account allows "less secure apps" or use App Password
- Check EmailJS dashboard for email logs
- Check browser console for errors
- Make sure all 3 IDs are correct

## Security Note
For production, consider moving these credentials to environment variables:
- Create `.env` file
- Add: 
  ```
  VITE_EMAILJS_SERVICE_ID=your_service_id
  VITE_EMAILJS_TEMPLATE_ID=your_template_id
  VITE_EMAILJS_PUBLIC_KEY=your_public_key
  ```
- Update code to use: `import.meta.env.VITE_EMAILJS_SERVICE_ID`
