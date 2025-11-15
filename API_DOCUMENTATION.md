# API Documentation

Complete API reference for the Proposal Platform.

**Base URL:** `http://localhost:5000/api` (Development)
**Production URL:** `https://api.yourdomain.com/api`

**Content-Type:** `application/json`
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Organizations](#organizations)
3. [Proposals](#proposals)
4. [Comments](#comments)
5. [Notifications](#notifications)
6. [File Uploads](#file-uploads)
7. [Error Handling](#error-handling)

---

## Authentication

### Register User

Creates a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clxxx....",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2025-01-14T12:00:00.000Z"
    }
  }
}
```

**Errors:**
- `400` - Validation error or user already exists

---

### Login

Authenticates user and returns JWT tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "mfaToken": "123456"  // Optional, required if MFA enabled
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clxxx....",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "8f3e..."
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - MFA token required

---

### Refresh Token

Refreshes the access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "8f3e..."
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Profile

Returns the authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clxxx....",
      "email": "user@example.com"
    }
  }
}
```

---

### Setup MFA

Generates MFA secret and QR code for user.

**Endpoint:** `POST /auth/mfa/setup`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,iVBORw0KGg..."
  }
}
```

---

### Verify MFA

Verifies and enables MFA for user.

**Endpoint:** `POST /auth/mfa/verify`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "MFA enabled successfully"
  }
}
```

---

## Organizations

### List Organizations

Returns all organizations the user is a member of.

**Endpoint:** `GET /organizations`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "organizations": [
      {
        "id": "clxxx....",
        "name": "Acme Corp",
        "slug": "acme-corp",
        "description": "Our company",
        "role": "OWNER",
        "joinedAt": "2025-01-14T12:00:00.000Z",
        "_count": {
          "members": 5,
          "proposals": 12
        }
      }
    ]
  }
}
```

---

### Create Organization

Creates a new organization.

**Endpoint:** `POST /organizations`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "name": "Acme Corp",
  "slug": "acme-corp",
  "description": "Our company"
}
```

**Validation:**
- `name`: Required, 1-100 characters
- `slug`: Required, 3-50 characters, lowercase letters, numbers, hyphens only
- `description`: Optional, max 500 characters

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "organization": {
      "id": "clxxx....",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "description": "Our company",
      "createdAt": "2025-01-14T12:00:00.000Z",
      "members": [...]
    }
  }
}
```

---

### Get Organization

Returns organization details with members.

**Endpoint:** `GET /organizations/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "organization": {
      "id": "clxxx....",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "description": "Our company",
      "members": [
        {
          "id": "member-id",
          "userId": "user-id",
          "role": "OWNER",
          "joinedAt": "2025-01-14T12:00:00.000Z",
          "user": {
            "id": "user-id",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe"
          }
        }
      ],
      "_count": {
        "proposals": 12
      }
    }
  }
}
```

---

### Invite Member

Invites a user to the organization.

**Endpoint:** `POST /organizations/:id/members`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "EDITOR"
}
```

**Roles:**
- `OWNER` - Full access
- `ADMIN` - Manage members and proposals
- `EDITOR` - Create and edit proposals
- `COMMENTATOR` - View and comment
- `VIEWER` - Read-only access

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "member": {
      "id": "member-id",
      "userId": "user-id",
      "role": "EDITOR",
      "user": {
        "email": "newuser@example.com",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  }
}
```

**Errors:**
- `403` - Insufficient permissions
- `404` - User not found
- `400` - User already a member

---

### Remove Member

Removes a member from the organization.

**Endpoint:** `DELETE /organizations/:id/members/:memberId`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Member removed successfully"
  }
}
```

---

### Update Member Role

Updates a member's role in the organization.

**Endpoint:** `PATCH /organizations/:id/members/:memberId/role`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "member": {
      "id": "member-id",
      "role": "ADMIN",
      "user": {...}
    }
  }
}
```

---

## Proposals

### List Proposals

Returns proposals user has access to.

**Endpoint:** `GET /proposals`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `organizationId` (optional) - Filter by organization

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "proposals": [
      {
        "id": "clxxx....",
        "title": "Q1 2025 Proposal",
        "description": "Partnership proposal",
        "content": "<p>Proposal content...</p>",
        "status": "DRAFT",
        "creator": {
          "id": "user-id",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "organization": {
          "id": "org-id",
          "name": "Acme Corp",
          "slug": "acme-corp"
        },
        "createdAt": "2025-01-14T12:00:00.000Z",
        "updatedAt": "2025-01-14T12:00:00.000Z",
        "_count": {
          "comments": 5,
          "versions": 3,
          "signatures": 0
        }
      }
    ]
  }
}
```

---

### Create Proposal

Creates a new proposal.

**Endpoint:** `POST /proposals`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "title": "Q1 2025 Proposal",
  "description": "Partnership proposal",
  "content": "<p>Proposal content...</p>",
  "organizationId": "org-id"
}
```

**Validation:**
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `content`: Required, min 1 character
- `organizationId`: Required, must be valid organization ID

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "proposal": {
      "id": "clxxx....",
      "title": "Q1 2025 Proposal",
      "status": "DRAFT",
      "creator": {...},
      "organization": {...},
      "versions": [...]
    }
  }
}
```

---

### Get Proposal

Returns proposal details with versions and comments.

**Endpoint:** `GET /proposals/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "proposal": {
      "id": "clxxx....",
      "title": "Q1 2025 Proposal",
      "description": "Partnership proposal",
      "content": "<p>Proposal content...</p>",
      "status": "DRAFT",
      "creator": {...},
      "organization": {...},
      "versions": [
        {
          "id": "version-id",
          "versionNumber": 1,
          "content": "<p>Version content...</p>",
          "changeDescription": "Initial version",
          "createdAt": "2025-01-14T12:00:00.000Z",
          "createdBy": {...}
        }
      ],
      "comments": [...],
      "collaborators": [...],
      "signatures": [...]
    }
  }
}
```

---

### Update Proposal

Updates proposal details.

**Endpoint:** `PATCH /proposals/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "title": "Q1 2025 Proposal (Updated)",
  "description": "Updated description",
  "content": "<p>Updated content...</p>",
  "status": "PENDING_REVIEW"
}
```

**Statuses:**
- `DRAFT`
- `PENDING_REVIEW`
- `UNDER_NEGOTIATION`
- `FINAL`
- `SIGNED`
- `ARCHIVED`
- `REJECTED`

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "proposal": {...}
  }
}
```

---

### Delete Proposal

Deletes a proposal (creator or org owner only).

**Endpoint:** `DELETE /proposals/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "message": "Proposal deleted successfully"
  }
}
```

---

### Add Collaborator

Adds a collaborator to a proposal.

**Endpoint:** `POST /proposals/:id/collaborators`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "email": "collaborator@example.com",
  "permission": "EDITOR"
}
```

**Permissions:**
- `OWNER` - Full access
- `EDITOR` - Can edit
- `COMMENTATOR` - Can comment
- `VIEWER` - Read-only

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "collaborator": {
      "id": "collab-id",
      "email": "collaborator@example.com",
      "permission": "EDITOR",
      "addedAt": "2025-01-14T12:00:00.000Z"
    }
  }
}
```

---

## Comments

### Get Comments

Returns all comments for a proposal.

**Endpoint:** `GET /proposals/:id/comments`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "comments": [
      {
        "id": "comment-id",
        "content": "Great proposal!",
        "author": {
          "id": "user-id",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2025-01-14T12:00:00.000Z",
        "updatedAt": "2025-01-14T12:00:00.000Z",
        "isResolved": false,
        "replies": [
          {
            "id": "reply-id",
            "content": "Thanks!",
            "author": {...},
            "createdAt": "2025-01-14T12:30:00.000Z"
          }
        ]
      }
    ]
  }
}
```

---

### Create Comment

Creates a new comment or reply.

**Endpoint:** `POST /proposals/:id/comments`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "content": "Great proposal!",
  "parentId": null,  // For replies, provide parent comment ID
  "anchorText": "specific text",  // Optional: for inline comments
  "anchorPosition": 42  // Optional: position in document
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "comment": {
      "id": "comment-id",
      "content": "Great proposal!",
      "author": {...},
      "createdAt": "2025-01-14T12:00:00.000Z"
    }
  }
}
```

---

### Update Comment

Updates a comment (author only).

**Endpoint:** `PATCH /proposals/:id/comments/:commentId`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response:** `200 OK`

---

### Delete Comment

Deletes a comment (author or proposal creator).

**Endpoint:** `DELETE /proposals/:id/comments/:commentId`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

---

### Resolve Comment

Marks a comment as resolved.

**Endpoint:** `POST /proposals/:id/comments/:commentId/resolve`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

---

## Notifications

### Get Notifications

Returns user's notifications.

**Endpoint:** `GET /notifications`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `limit` (optional, default: 50) - Number of notifications
- `offset` (optional, default: 0) - Pagination offset
- `unreadOnly` (optional, default: false) - Filter unread only

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "notif-id",
        "type": "PROPOSAL_CREATED",
        "title": "New Proposal Created",
        "message": "John Doe created: Q1 2025 Proposal",
        "isRead": false,
        "createdAt": "2025-01-14T12:00:00.000Z",
        "resourceType": "proposal",
        "resourceId": "proposal-id"
      }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

---

### Mark as Read

Marks a notification as read.

**Endpoint:** `POST /notifications/:id/read`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`

---

### Mark All as Read

Marks all notifications as read.

**Endpoint:** `POST /notifications/mark-all-read`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "count": 15
  }
}
```

---

## File Uploads

### Upload Document

Uploads a file directly via multipart form.

**Endpoint:** `POST /upload/document`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - File to upload (max 50MB)
- `organizationId` - Organization ID
- `proposalId` - Proposal ID (optional)

**Allowed File Types:**
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- TXT, JPG, PNG, GIF

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "fileUrl": "https://s3.amazonaws.com/.../file.pdf",
    "fileName": "proposal.pdf",
    "fileSize": 1024000,
    "fileMimeType": "application/pdf"
  }
}
```

---

### Get Upload URL

Gets presigned URL for direct browser upload (large files).

**Endpoint:** `POST /upload/upload-url`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "fileName": "large-document.pdf",
  "fileType": "application/pdf",
  "organizationId": "org-id",
  "proposalId": "proposal-id"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/...",
    "fileKey": "org-id/proposal-id/abc123.pdf"
  }
}
```

---

### Get Download URL

Gets presigned download URL for a file.

**Endpoint:** `GET /upload/download/:fileKey`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "url": "https://s3.amazonaws.com/...?signature=..."
  }
}
```

**URL expires in 1 hour**

---

## Error Handling

All errors follow consistent format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### Common Errors

**Validation Error:**
```json
{
  "status": "error",
  "message": "Title is required"
}
```

**Authentication Error:**
```json
{
  "status": "error",
  "message": "Invalid token"
}
```

**Permission Error:**
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

---

## Rate Limiting

- **Authentication endpoints:** 5 requests per 15 minutes
- **General API:** 100 requests per 15 minutes

Rate limit info in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642176000
```

---

## Webhooks (Coming Soon)

Subscribe to events:
- `proposal.created`
- `proposal.updated`
- `proposal.signed`
- `comment.added`
- `member.invited`

---

## Support

For API support:
- Check [SETUP.md](./SETUP.md) for setup issues
- Review error messages and status codes
- Enable debug logging in development
- Create issue in repository

**Last Updated:** January 2025
**API Version:** 1.0
