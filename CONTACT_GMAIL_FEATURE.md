# Gmail Authentication for Contact Form

## Feature Overview
The contact form now supports sending messages FROM the authenticated user's Gmail account TO `wondedev369@gmail.com`.

## How It Works

### 1. Google OAuth Login
Users authenticate with Google via the `/api/auth/google` endpoint:

```bash
POST /api/auth/google
Content-Type: application/json

{
  "email": "wondewosen@gmail.com",
  "name": "Wondwosen Assegid",
  "avatar": null
}

# Response: {"token":"...", "user":{...}}
```

### 2. Submit Contact Form with Authentication
After login, the JWT token is included in the contact form request:

```bash
POST /api/contact
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "name": "Wondwosen Assegid",
  "email": "wondewosen@gmail.com",
  "subject": "Hello from Gmail",
  "message": "This is from my Gmail account!"
}

# Response: 201 Created
```

### 3. Email Flow
- **From**: Authenticated user's Gmail account (e.g., `wondewosen@gmail.com`)
- **To**: `wondedev369@gmail.com`
- **Admin notification**: Sent with Gmail as the sender
- **Auto-reply**: Sent to the user from the server

## Backend Changes

### File: `server/controllers/contactController.js`
- Extracts `req.user?.email` when JWT token is present
- Falls back to form `email` field when not authenticated
- Passes authenticated Gmail to email service

### File: `server/utils/emailService.js`
- `sendContactEmails()` now detects Gmail addresses in `formData.email`
- If `@gmail.com` detected, uses it as `from` address for admin notification
- Admin email goes to `wondedev369@gmail.com`

### File: `server/controllers/authController.js`
- Google OAuth accepts email/name and creates/returns JWT token
- Token contains user's email for later use

## Frontend Changes

### File: `client/src/pages/Contact.jsx`
- Google login button saves JWT to `localStorage`
- `handleSubmit()` automatically includes auth token via axios interceptor
- User sees success message after submission

### File: `client/src/api.js`
- Request interceptor adds `Authorization: Bearer <token>` to all API requests
- Automatically handles auth for all endpoints

## Testing

### Without Authentication
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Regular User","email":"user@example.com","subject":"Test","message":"Hi"}'
# Returns 201, saves as user@example.com
```

### With Gmail Authentication
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"email":"wondewosen@gmail.com","name":"Wondwosen"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Submit with auth
curl -X POST http://localhost:5000/api/contact \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Wondwosen","email":"wondewosen@gmail.com","subject":"Gmail","message":"From Gmail!"}'
# Returns 201, email from: wondewosen@gmail.com, to: wondedev369@gmail.com
```

## Database Schema
`contact_messages` table stores all submissions:
```sql
id | name | email | subject | message | created_at
---|------|-------|---------|---------|----------
8  | Wondwosen Assegid | wondewosen@gmail.com | Gmail Auth | ... | 2026-04-27 22:15:24
```

## Email Configuration
`.env` file:
```
EMAIL_SERVICE=gmail
EMAIL_USER=wondedev369@gmail.com
EMAIL_PASS=<gmail_app_password>
ADMIN_EMAIL=wondedev369@gmail.com
```

**Note**: In development, the Gmail SMTP uses `EMAIL_USER`/`EMAIL_PASS`. In production with real Gmail OAuth, the `from` field will be the authenticated user's Gmail account.

## Security Considerations
- JWT tokens expire in 24 hours
- Email addresses validated via Google OAuth in production
- Rate limiting on `/api/contact` endpoint
- File attachments limited to 50MB

## Future Enhancements
- Real Google OAuth2 flow (not mock)
- OAuth scopes for Gmail send
- Refresh token support
- Sent folder tracking