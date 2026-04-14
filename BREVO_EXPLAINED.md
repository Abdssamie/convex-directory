# Brevo API Explained

## Two Ways to Send Emails via Brevo API

### Option 1: With `templateId` (YOUR OLD TEMPLATES - CORRECT)

Template stored in Brevo has FULL HTML body with `{{params.variable}}` variables:

```html
<!-- In Brevo Dashboard - Template has full body -->
<html>
  <body>
    <h1>Welcome {{params.name}}!</h1>
    <p>Click here: {{params.verificationUrl}}</p>
  </body>
</html>
```

API call sends only the data:

```json
{
  "templateId": 123,
  "params": { "name": "John", "verificationUrl": "https://..." }
}
```

**How it works:** Brevo substitutes `{{params.name}}` with "John" from your `params`.

---

### Option 2: Without `templateId` (RAW HTML)

Send full HTML in the API request:

```json
{
  "subject": "Verify email",
  "htmlContent": "<html>...</html>",
  "params": { "someVar": "value" }
}
```

**How it works:** You provide the entire email body in `htmlContent`.

---

## The Problem with My Implementation

My `syncRequiredTemplates()` created this BAD template:

```html
<!-- WRONG - template has placeholder {{content}} as the WHOLE body -->
<body>
  <h1>{{subject}}</h1>
  <p>{{content}}</p>
</body>
```

**Why it's wrong:** Brevo does NOT substitute `{{content}}` when you use `templateId`. The docs clearly state:

> "htmlContent: Required if templateId is not provided. Ignored if templateId is provided."

So with `templateId`, the `htmlContent` parameter is IGNORED. Your email would send EMPTY.

---

## How Your OLD Templates Should Work

Your existing templates in Brevo have:

- Full static HTML structure (header, footer, branding)
- Only dynamic variables like `{{params.name}}`, `{{params.verificationUrl}}`

Then API call:

```json
{
  "templateId": 8,
  "params": { "name": "John", "verificationUrl": "https://..." }
}
```

Brevo merges them - the template provides structure, params provide personalization.

---

## Fix Needed

1. DELETE the bad templates created by my sync (the ones with `{{content}}` placeholder)

2. Use your OLD working approach - templates with full HTML body already in Brevo, just add `{{params.variableName}}` where needed

3. OR if you want code-controlled body: send without `templateId` and pass `htmlContent` directly in API request

The first approach is what you already had working. My code broke it by creating templates that assume you can pass full HTML via params, which Brevo doesn't support.
