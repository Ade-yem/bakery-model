# TallyBakery Authentication Endpoints (Better-Auth)

This document provides request and response specifications for the authentication endpoints exposed by Better-Auth under `/api/auth`.

> **Frontend Integration Notes**
> - **Base Path**: `/api/auth` (e.g., `http://localhost:3000/api/auth`)
> - **Cookies**: Always include `credentials: 'include'` on `fetch` / HTTP client requests so the `better-auth.session_token` HTTP-only cookie is stored and sent automatically.
> - **Trusted Origins**: State-changing `POST` requests must originate from an origin listed in `TRUSTED_ORIGINS`.
> - **Tenant Context**: After signing in, call `GET /api/v1/me` (see [endpoints.md](./endpoints.md#2-identity--me)) to resolve the user's active tenant membership, branches, departments, and permissions.

---

## 1. Sign Up (Email & Password)

### `POST /api/auth/sign-up/email`

Registers a new user account with email and password. Because `autoSignIn` is enabled, a session cookie (`better-auth.session_token`) is automatically issued on success.

- **Authentication**: None
- **Request Body**:

```json
{
  "name": "Adaeze Okafor",
  "email": "adaeze@goldenloaf.ng",
  "password": "StrongPassword123!",
  "image": "https://cdn.example.com/avatars/adaeze.png"
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Display name of the user. |
| `email` | string | Yes | Unique email address. |
| `password` | string | Yes | User password. |
| `image` | string | No | Optional avatar URL. |

- **Response (200 OK)**:

Sets `Set-Cookie: better-auth.session_token=...; HttpOnly; Path=/; SameSite=Lax`.

```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "usr_01h9a2b3c4d5e6f7",
    "email": "adaeze@goldenloaf.ng",
    "name": "Adaeze Okafor",
    "image": "https://cdn.example.com/avatars/adaeze.png",
    "emailVerified": false,
    "createdAt": "2026-11-17T12:00:00.000Z",
    "updatedAt": "2026-11-17T12:00:00.000Z"
  }
}
```

- **Error Responses**:
  - `422 Unprocessable Entity` / `400 Bad Request` — Validation error or email already exists (`USER_ALREADY_EXISTS`).

---

## 2. Sign In (Email & Password)

### `POST /api/auth/sign-in/email`

Authenticates an existing user and issues the `better-auth.session_token` HTTP-only session cookie.

- **Authentication**: None
- **Request Body**:

```json
{
  "email": "adaeze@goldenloaf.ng",
  "password": "StrongPassword123!",
  "rememberMe": true
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | Registered email address. |
| `password` | string | Yes | Account password. |
| `rememberMe` | boolean | No | Whether to persist the session beyond the browser session (defaults to `true`). |

- **Response (200 OK)**:

Sets `Set-Cookie: better-auth.session_token=...; HttpOnly; Path=/; SameSite=Lax`.

```json
{
  "redirect": false,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "usr_01h9a2b3c4d5e6f7",
    "email": "adaeze@goldenloaf.ng",
    "name": "Adaeze Okafor",
    "image": null,
    "emailVerified": false,
    "createdAt": "2026-11-17T12:00:00.000Z",
    "updatedAt": "2026-11-17T12:00:00.000Z"
  }
}
```

- **Error Responses**:
  - `401 Unauthorized` — Invalid email or password (`INVALID_EMAIL_OR_PASSWORD`).

---

## 3. Sign Out

### `POST /api/auth/sign-out`

Invalidates the current session and clears the `better-auth.session_token` cookie.

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Request Body**: `{}` (empty JSON object or omitted)
- **Response (200 OK)**:

```json
{
  "success": true
}
```

---

## 4. Get Current Session

### `GET /api/auth/get-session`

Returns the active session and user object for the current cookie, or `null` if unauthenticated.

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Response (200 OK — Authenticated)**:

```json
{
  "session": {
    "id": "ses_01h9a2b3c4d5e6f7",
    "userId": "usr_01h9a2b3c4d5e6f7",
    "token": "eyJhbGciOi...",
    "expiresAt": "2026-11-24T12:00:00.000Z",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0 ...",
    "createdAt": "2026-11-17T12:00:00.000Z",
    "updatedAt": "2026-11-17T12:00:00.000Z"
  },
  "user": {
    "id": "usr_01h9a2b3c4d5e6f7",
    "email": "adaeze@goldenloaf.ng",
    "name": "Adaeze Okafor",
    "image": null,
    "emailVerified": false,
    "createdAt": "2026-11-17T12:00:00.000Z",
    "updatedAt": "2026-11-17T12:00:00.000Z"
  }
}
```

- **Response (200 OK — Unauthenticated)**:

```json
null
```

---

## 5. Session Management

### `GET /api/auth/list-sessions`

Lists all active sessions for the currently authenticated user.

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Response (200 OK)**:

```json
[
  {
    "id": "ses_01h9a2b3c4d5e6f7",
    "userId": "usr_01h9a2b3c4d5e6f7",
    "token": "eyJhbGciOi...",
    "expiresAt": "2026-11-24T12:00:00.000Z",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0 ...",
    "createdAt": "2026-11-17T12:00:00.000Z",
    "updatedAt": "2026-11-17T12:00:00.000Z"
  }
]
```

---

### `POST /api/auth/revoke-session`

Revokes a specific session by its token.

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Request Body**:

```json
{
  "token": "eyJhbGciOi..."
}
```

- **Response (200 OK)**:

```json
{
  "status": true
}
```

---

### `POST /api/auth/revoke-other-sessions`

Revokes all sessions for the current user except the current active session.

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Request Body**: `{}`
- **Response (200 OK)**:

```json
{
  "status": true
}
```

---

### `POST /api/auth/revoke-sessions`

Revokes all sessions for the current user, including the current session.

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Request Body**: `{}`
- **Response (200 OK)**:

```json
{
  "status": true
}
```

---

## 6. Account & Password Management

### `POST /api/auth/update-user`

Updates the authenticated user's profile fields (`name`, `image`).

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Request Body**:

```json
{
  "name": "Adaeze Okafor-Nwosu",
  "image": "https://cdn.example.com/avatars/adaeze-new.png"
}
```

- **Response (200 OK)**:

```json
{
  "status": true
}
```

---

### `POST /api/auth/change-password`

Changes the authenticated user's password.

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Request Body**:

```json
{
  "currentPassword": "StrongPassword123!",
  "newPassword": "NewStrongPassword456!",
  "revokeOtherSessions": true
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `currentPassword` | string | Yes | Existing password for verification. |
| `newPassword` | string | Yes | New password. |
| `revokeOtherSessions` | boolean | No | If `true`, revokes all other active sessions. |

- **Response (200 OK)**:

```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "usr_01h9a2b3c4d5e6f7",
    "email": "adaeze@goldenloaf.ng",
    "name": "Adaeze Okafor",
    "image": null,
    "emailVerified": false,
    "createdAt": "2026-11-17T12:00:00.000Z",
    "updatedAt": "2026-11-17T12:05:00.000Z"
  }
}
```

---

### `POST /api/auth/change-email`

Updates the authenticated user's email address.

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Request Body**:

```json
{
  "newEmail": "adaeze.new@goldenloaf.ng"
}
```

- **Response (200 OK)**:

```json
{
  "status": true
}
```

---

### `POST /api/auth/delete-user`

Permanently deletes the authenticated user's account.

- **Authentication**: Session cookie (`better-auth.session_token`)
- **Request Body**:

```json
{
  "password": "StrongPassword123!"
}
```

- **Response (200 OK)**:

```json
{
  "success": true,
  "message": "User deleted"
}
```

