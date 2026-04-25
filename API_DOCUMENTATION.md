# DevLinks API Documentation

Complete API reference for the DevLinks platform.

## Base URL

```
http://localhost:8000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### Register New User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "plan": "free",
  "is_active": true,
  "created_at": "2026-04-26T10:30:00Z"
}
```

**Errors:**
- `400` - Email already registered
- `422` - Validation error (invalid email, password too short)

---

### Login

Authenticate and receive access tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401` - Invalid email or password
- `403` - User account is inactive

---

### Get Current User

Get information about the authenticated user.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "plan": "free",
  "is_active": true,
  "created_at": "2026-04-26T10:30:00Z"
}
```

**Errors:**
- `401` - Invalid or expired token

---

## 🔗 Link Management Endpoints

### Create Short Link

Create a new shortened link.

**Endpoint:** `POST /links/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "original_url": "https://example.com/very-long-url",
  "custom_slug": "my-link",  // Optional
  "expires_at": "2026-12-31T23:59:59Z"  // Optional
}
```

**Response:** `201 Created`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "original_url": "https://example.com/very-long-url",
  "slug": "abc123",
  "short_url": "http://localhost:8000/abc123",
  "is_active": true,
  "created_at": "2026-04-26T10:30:00Z"
}
```

**Errors:**
- `401` - Not authenticated
- `422` - Invalid URL format
- `400` - Custom slug already taken (if provided)

---

### Get All User Links

Retrieve all links created by the authenticated user.

**Endpoint:** `GET /links/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records (default: 100)

**Response:** `200 OK`
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "original_url": "https://example.com/page1",
    "slug": "abc123",
    "short_url": "http://localhost:8000/abc123",
    "is_active": true,
    "created_at": "2026-04-26T10:30:00Z"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "original_url": "https://example.com/page2",
    "slug": "xyz789",
    "short_url": "http://localhost:8000/xyz789",
    "is_active": true,
    "created_at": "2026-04-25T15:20:00Z"
  }
]
```

**Errors:**
- `401` - Not authenticated

---

### Delete Link

Delete a specific link.

**Endpoint:** `DELETE /links/{slug}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `204 No Content`

**Errors:**
- `401` - Not authenticated
- `404` - Link not found or doesn't belong to user

---

### Redirect to Original URL

Redirect to the original URL and track analytics.

**Endpoint:** `GET /{slug}`

**Response:** `307 Temporary Redirect`

Redirects to the original URL.

**Errors:**
- `404` - Link not found
- `410` - Link has expired

**Note:** This endpoint also triggers analytics tracking in the background.

---

## 📊 Analytics Endpoints

### Get Link Analytics

Retrieve detailed analytics for a specific link.

**Endpoint:** `GET /analytics/{slug}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 30)

**Response:** `200 OK`
```json
{
  "slug": "abc123",
  "total_clicks": 1490,
  "daily_clicks": [
    {
      "_id": "2026-04-20",
      "count": 120
    },
    {
      "_id": "2026-04-21",
      "count": 180
    }
  ],
  "devices": [
    {
      "_id": "mobile",
      "count": 1013
    },
    {
      "_id": "desktop",
      "count": 358
    },
    {
      "_id": "tablet",
      "count": 119
    }
  ],
  "browsers": [
    {
      "_id": "chrome",
      "count": 892
    },
    {
      "_id": "safari",
      "count": 345
    },
    {
      "_id": "firefox",
      "count": 253
    }
  ],
  "sources": [
    {
      "_id": "whatsapp",
      "count": 892
    },
    {
      "_id": "instagram",
      "count": 345
    },
    {
      "_id": "direct",
      "count": 253
    }
  ],
  "top_locations": [
    {
      "_id": {
        "country": "India",
        "city": "Mumbai"
      },
      "count": 456
    },
    {
      "_id": {
        "country": "India",
        "city": "Delhi"
      },
      "count": 234
    }
  ],
  "period_days": 30
}
```

**Errors:**
- `401` - Not authenticated
- `404` - Link not found or access denied

---

## 🏥 Health Check

### Health Status

Check if the API is operational.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "healthy"
}
```

---

### Root Endpoint

Get API information.

**Endpoint:** `GET /`

**Response:** `200 OK`
```json
{
  "message": "Welcome to devlinks API",
  "docs": "/docs",
  "status": "operational"
}
```

---

## 📝 Data Models

### User

```typescript
{
  id: UUID
  email: string
  plan: "free" | "pro"
  is_active: boolean
  created_at: datetime
}
```

### Link

```typescript
{
  id: UUID
  user_id: UUID
  original_url: string
  slug: string
  is_custom_slug: boolean
  expires_at: datetime | null
  is_active: boolean
  created_at: datetime
}
```

### Click Analytics (MongoDB)

```typescript
{
  slug: string
  timestamp: datetime
  ip: string
  user_agent: string
  referer: string | null
  device: string
  browser: string
  os: string
  source: string
  country: string | null
  city: string | null
}
```

---

## 🔒 Security

### Password Requirements

- Minimum 6 characters
- Hashed using bcrypt

### JWT Tokens

- **Access Token**: Expires in 30 minutes
- **Refresh Token**: Expires in 7 days
- Algorithm: HS256

### Rate Limiting

Currently not implemented. Consider adding rate limiting in production.

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `410` - Gone (expired link)
- `422` - Validation Error
- `500` - Internal Server Error

---

## 📚 Interactive Documentation

FastAPI provides interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🧪 Example Usage

### Complete Flow Example

```bash
# 1. Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}' \
  | jq -r '.access_token')

# 3. Create Link
curl -X POST http://localhost:8000/links/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"original_url": "https://example.com/long-url"}'

# 4. Get All Links
curl -X GET http://localhost:8000/links/ \
  -H "Authorization: Bearer $TOKEN"

# 5. Get Analytics
curl -X GET http://localhost:8000/analytics/abc123?days=7 \
  -H "Authorization: Bearer $TOKEN"

# 6. Access Short Link (triggers redirect and analytics)
curl -L http://localhost:8000/abc123
```

---

## 🔄 CORS Configuration

The API allows requests from:
- http://localhost:3000
- http://localhost:5173
- http://localhost:8000

Configure additional origins in `.env`:

```env
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## 📦 Response Headers

All responses include:
- `Content-Type: application/json`
- CORS headers (if configured)

---

## 🎯 Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (httpOnly cookies recommended)
3. **Implement rate limiting**
4. **Validate all inputs**
5. **Handle token expiration** (implement refresh token flow)
6. **Log all errors** for debugging
7. **Monitor API performance**

---

## 📞 Support

For issues or questions:
- Check `/docs` for interactive documentation
- Review error messages in responses
- Check server logs for detailed errors

---

Built with FastAPI ⚡
