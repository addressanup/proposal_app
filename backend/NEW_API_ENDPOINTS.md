# New API Endpoints Documentation

## Document Management API

### Upload Document
Upload a document to a proposal.

**Endpoint:** `POST /api/proposals/:proposalId/documents`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request:**
```
Form Data:
  file: [Binary file data]
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "document": {
      "id": "clxxx...",
      "originalFileName": "proposal.pdf",
      "storedFileName": "abc123...pdf",
      "fileUrl": "https://s3.amazonaws.com/...",
      "thumbnailUrl": null,
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "pageCount": null,
      "processingStatus": "PENDING",
      "virusScanStatus": "PENDING",
      "createdAt": "2025-11-15T10:30:00.000Z"
    }
  }
}
```

---

### Get Proposal Documents
Get all documents for a specific proposal.

**Endpoint:** `GET /api/proposals/:proposalId/documents`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "id": "clxxx...",
        "originalFileName": "proposal.pdf",
        "fileSize": 2048576,
        "mimeType": "application/pdf",
        "processingStatus": "COMPLETED",
        "virusScanStatus": "CLEAN",
        "createdAt": "2025-11-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Get Document
Get a specific document by ID.

**Endpoint:** `GET /api/documents/:documentId`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "document": {
      "id": "clxxx...",
      "originalFileName": "proposal.pdf",
      "fileUrl": "https://s3.amazonaws.com/...",
      "fileSize": 2048576,
      "processingStatus": "COMPLETED",
      "virusScanStatus": "CLEAN"
    }
  }
}
```

---

### Get Document Download URL
Get a signed download URL for a document.

**Endpoint:** `GET /api/documents/:documentId/download?expiresIn=3600`

**Authentication:** Required

**Query Parameters:**
- `expiresIn` (optional): URL expiration time in seconds (default: 3600)

**Response:**
```json
{
  "status": "success",
  "data": {
    "downloadUrl": "https://s3.amazonaws.com/...?signature=...",
    "expiresIn": 3600
  }
}
```

---

### Delete Document
Delete a document.

**Endpoint:** `DELETE /api/documents/:documentId`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "message": "Document deleted successfully"
}
```

---

## Sharing API

### Create Share Link
Create a shareable link for a proposal.

**Endpoint:** `POST /api/sharing/links`

**Authentication:** Required

**Request Body:**
```json
{
  "proposalId": "clxxx...",
  "recipientEmail": "client@example.com",
  "recipientName": "John Doe",
  "linkType": "EMAIL_SPECIFIC",
  "allowedEmails": ["client@example.com"],
  "requiresPassword": false,
  "password": "optional-password",
  "expiresInDays": 30,
  "isOneTime": false,
  "canComment": true,
  "canDownload": true,
  "canSign": false,
  "customMessage": "Please review this proposal at your earliest convenience.",
  "sendEmail": true
}
```

**Link Types:**
- `PUBLIC` - Anyone with the link
- `EMAIL_SPECIFIC` - Only specified emails
- `ONE_TIME` - Single use only
- `PASSWORD_PROTECTED` - Requires password

**Response:**
```json
{
  "status": "success",
  "data": {
    "shareLink": {
      "id": "clxxx...",
      "token": "abc123...",
      "linkType": "EMAIL_SPECIFIC",
      "shareUrl": "http://localhost:3000/p/abc123...",
      "recipientEmail": "client@example.com",
      "recipientName": "John Doe",
      "expiresAt": "2025-12-15T10:30:00.000Z",
      "canComment": true,
      "canDownload": true,
      "canSign": false,
      "viewCount": 0,
      "createdAt": "2025-11-15T10:30:00.000Z"
    }
  }
}
```

---

### Get Shared Proposal Info (Public)
Get proposal information via share link - **No authentication required**.

**Endpoint:** `GET /api/sharing/preview/:token`

**Authentication:** None

**Response:**
```json
{
  "status": "success",
  "data": {
    "proposal": {
      "id": "clxxx...",
      "title": "Website Redesign Proposal",
      "description": "Complete website redesign and development",
      "status": "PENDING_REVIEW",
      "createdAt": "2025-11-10T10:00:00.000Z",
      "creator": {
        "name": "Jane Smith",
        "email": "jane@agency.com"
      },
      "organization": {
        "id": "clxxx...",
        "name": "Design Agency Inc",
        "slug": "design-agency"
      },
      "documents": [
        {
          "id": "clxxx...",
          "originalFileName": "proposal.pdf",
          "fileSize": 2048576,
          "mimeType": "application/pdf",
          "thumbnailUrl": "https://...",
          "pageCount": 15,
          "createdAt": "2025-11-10T10:30:00.000Z"
        }
      ]
    },
    "shareLink": {
      "canComment": true,
      "canDownload": true,
      "canSign": false,
      "customMessage": "Please review this proposal...",
      "recipientName": "John Doe",
      "requiresPassword": false,
      "expiresAt": "2025-12-15T10:30:00.000Z"
    }
  }
}
```

---

### Access Proposal Via Link (Public)
Validate access to a proposal via share link - **No authentication required**.

**Endpoint:** `POST /api/sharing/access/:token`

**Authentication:** None

**Request Body:**
```json
{
  "email": "client@example.com",
  "password": "optional-if-required"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "proposalId": "clxxx...",
    "canComment": true,
    "canDownload": true,
    "canSign": false,
    "requiresSignup": true
  }
}
```

**Errors:**
- `404` - Invalid or expired link
- `403` - Link expired or already used
- `401` - Email or password required
- `403` - Not authorized (email not in allowed list)

---

### Get Proposal Share Links
Get all share links for a proposal.

**Endpoint:** `GET /api/proposals/:proposalId/share-links`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "shareLinks": [
      {
        "id": "clxxx...",
        "token": "abc123...",
        "linkType": "EMAIL_SPECIFIC",
        "shareUrl": "http://localhost:3000/p/abc123...",
        "recipientEmail": "client@example.com",
        "viewCount": 5,
        "createdAt": "2025-11-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Revoke Share Link
Revoke a share link.

**Endpoint:** `DELETE /api/sharing/links/:shareLinkId`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "message": "Share link revoked successfully"
}
```

---

### Log Link Action (Public)
Log an action on a share link (download, comment, sign) - **No authentication required**.

**Endpoint:** `POST /api/sharing/log-action/:token`

**Authentication:** None

**Request Body:**
```json
{
  "action": "DOWNLOADED",
  "email": "client@example.com"
}
```

**Actions:**
- `VIEWED`
- `DOWNLOADED`
- `COMMENTED`
- `SIGNED`
- `AUTHENTICATED`

**Response:**
```json
{
  "status": "success",
  "message": "Action logged"
}
```

---

## Connection API

### Create Connection
Manually create a connection with another user.

**Endpoint:** `POST /api/connections`

**Authentication:** Required

**Request Body:**
```json
{
  "recipientId": "clxxx...",
  "proposalId": "clxxx...",
  "notes": "Connected via project collaboration"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "connection": {
      "id": "clxxx...",
      "initiatorId": "clxxx...",
      "recipientId": "clxxx...",
      "initiator": {
        "id": "clxxx...",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@agency.com"
      },
      "recipient": {
        "id": "clxxx...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@client.com"
      },
      "connectionType": "CROSS_ORGANIZATION",
      "status": "ACTIVE",
      "originProposalId": "clxxx...",
      "connectedAt": "2025-11-15T10:30:00.000Z"
    }
  }
}
```

---

### Get User Connections
Get all connections for the current user.

**Endpoint:** `GET /api/connections?status=ACTIVE`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, ACTIVE, BLOCKED, ARCHIVED)

**Response:**
```json
{
  "status": "success",
  "data": {
    "connections": [
      {
        "id": "clxxx...",
        "connectionType": "CROSS_ORGANIZATION",
        "status": "ACTIVE",
        "initiator": {
          "id": "clxxx...",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane@agency.com"
        },
        "recipient": {
          "id": "clxxx...",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@client.com"
        },
        "connectedAt": "2025-11-15T10:30:00.000Z",
        "lastInteraction": "2025-11-15T12:00:00.000Z"
      }
    ]
  }
}
```

---

### Get Connection with User
Get connection details with a specific user.

**Endpoint:** `GET /api/connections/user/:userId`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "connection": {
      "id": "clxxx...",
      "connectionType": "SAME_ORGANIZATION",
      "status": "ACTIVE",
      "connectedAt": "2025-11-15T10:30:00.000Z"
    }
  }
}
```

---

### Check Connection
Check if connected with a specific user.

**Endpoint:** `GET /api/connections/check/:userId`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "isConnected": true
  }
}
```

---

### Update Connection Status
Update the status of a connection.

**Endpoint:** `PATCH /api/connections/:connectionId`

**Authentication:** Required

**Request Body:**
```json
{
  "status": "BLOCKED"
}
```

**Statuses:**
- `PENDING`
- `ACTIVE`
- `BLOCKED`
- `ARCHIVED`

**Response:**
```json
{
  "status": "success",
  "data": {
    "connection": {
      "id": "clxxx...",
      "status": "BLOCKED"
    }
  }
}
```

---

### Block Connection
Block a connection.

**Endpoint:** `POST /api/connections/:connectionId/block`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "message": "Connection blocked successfully"
}
```

---

### Archive Connection
Archive a connection.

**Endpoint:** `POST /api/connections/:connectionId/archive`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "message": "Connection archived successfully"
}
```

---

### Activate Connection
Activate a blocked or archived connection.

**Endpoint:** `POST /api/connections/:connectionId/activate`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "message": "Connection activated successfully"
}
```

---

### Get Connection Stats
Get connection statistics for current user.

**Endpoint:** `GET /api/connections/stats`

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "total": 25,
      "active": 20,
      "pending": 2,
      "blocked": 3,
      "byType": {
        "sameOrganization": 10,
        "crossOrganization": 8,
        "externalCollaborator": 2
      }
    }
  }
}
```

---

## Updated Auth API

### Register with Share Link
Register a new user and automatically create connection if shareToken is provided.

**Endpoint:** `POST /api/auth/register`

**Authentication:** None

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "shareToken": "abc123..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "newuser@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": false
    }
  }
}
```

**Note:** If `shareToken` is provided:
1. User is registered
2. Connection is automatically created with proposal creator
3. Welcome email is sent to new user
4. Connection notification is sent to proposal creator

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in or invalid token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## Example Workflows

### Complete Proposal Sharing Flow

1. **Upload Document:**
```bash
POST /api/proposals/{proposalId}/documents
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: proposal.pdf
```

2. **Create Share Link:**
```bash
POST /api/sharing/links
Authorization: Bearer {token}

{
  "proposalId": "clxxx...",
  "recipientEmail": "client@example.com",
  "recipientName": "John Doe",
  "linkType": "EMAIL_SPECIFIC",
  "sendEmail": true,
  "customMessage": "Please review our proposal"
}
```

3. **Recipient Views Proposal (Public):**
```bash
GET /api/sharing/preview/{shareToken}
```

4. **Recipient Registers:**
```bash
POST /api/auth/register

{
  "email": "client@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "shareToken": "{shareToken}"
}
```

5. **Connection Automatically Created** ✅

6. **Check Connections:**
```bash
GET /api/connections
Authorization: Bearer {token}
```

---

## Rate Limiting

All endpoints are rate-limited:
- **Default:** 100 requests per 15 minutes per IP
- **File Upload:** 10 uploads per hour per user
- **Share Link Access:** 50 requests per hour per IP (public endpoints)

---

## File Upload Limits

- **Max File Size:** 50MB
- **Allowed Types:** PDF, DOCX, DOC, XLSX, XLS, Images (JPEG, PNG, GIF)
- **Virus Scanning:** Automatic (async processing)
- **Storage:** AWS S3 with server-side encryption

---

**Last Updated:** 2025-11-15
