# Contact Controller API Documentation

## Overview
The Contact Controller manages contact form submissions and inquiries. It provides endpoints for public contact submissions and protected endpoints for HR/Admin to manage and respond to contacts.

## Model Schema

```javascript
{
    name: String (required),
    email: String (required),
    phone: String (optional),
    subject: String (default: 'General Inquiry'),
    message: String (required),
    status: String (enum: ['New', 'Read', 'Replied'], default: 'New'),
    createdAt: Date (auto-generated)
}
```

## Endpoints

### 1. Create Contact Message (Public)
**POST** `/api/contact`

Submit a new contact form message.

**Access:** Public (no authentication required)

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Partnership Inquiry",
    "message": "I would like to discuss a potential partnership..."
}
```

**Response (201):**
```json
{
    "success": true,
    "message": "Contact message sent successfully",
    "data": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "subject": "Partnership Inquiry",
        "message": "I would like to discuss...",
        "status": "New",
        "createdAt": "2026-02-11T17:00:00.000Z"
    }
}
```

**Features:**
- Automatically sends email notification to admin
- Validates required fields (name, email, message)
- Sets default status to 'New'

---

### 2. Get All Contacts (Protected)
**GET** `/api/contact`

Retrieve all contact messages with filtering, search, and pagination.

**Access:** Private (HR, Admin, Super Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status ('New', 'Read', 'Replied')
- `search` (optional): Search in name, email, or subject
- `limit` (optional): Number of results per page (default: 50)
- `page` (optional): Page number (default: 1)

**Example Request:**
```
GET /api/contact?status=New&search=john&limit=20&page=1
```

**Response (200):**
```json
{
    "success": true,
    "count": 15,
    "total": 45,
    "page": 1,
    "pages": 3,
    "data": [
        {
            "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890",
            "subject": "Partnership Inquiry",
            "message": "I would like to discuss...",
            "status": "New",
            "createdAt": "2026-02-11T17:00:00.000Z"
        }
        // ... more contacts
    ]
}
```

---

### 3. Get Single Contact (Protected)
**GET** `/api/contact/:id`

Retrieve a specific contact message by ID.

**Access:** Private (HR, Admin, Super Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "subject": "Partnership Inquiry",
        "message": "I would like to discuss...",
        "status": "Read",
        "createdAt": "2026-02-11T17:00:00.000Z"
    }
}
```

**Features:**
- Automatically marks message as 'Read' if status is 'New'

---

### 4. Update Contact Status (Protected)
**PUT** `/api/contact/:id/status`

Update the status of a contact message.

**Access:** Private (HR, Admin, Super Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "status": "Replied"
}
```

**Valid Status Values:**
- `New`
- `Read`
- `Replied`

**Response (200):**
```json
{
    "success": true,
    "message": "Status updated successfully",
    "data": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "name": "John Doe",
        "status": "Replied",
        // ... other fields
    }
}
```

---

### 5. Reply to Contact (Protected)
**POST** `/api/contact/reply`

Send an email reply to a contact message.

**Access:** Private (HR, Admin, Super Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
    "contactId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "john@example.com",
    "subject": "Re: Partnership Inquiry",
    "message": "Thank you for reaching out. We would be happy to discuss..."
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Reply sent successfully"
}
```

**Features:**
- Sends email to the contact's email address
- Automatically updates contact status to 'Replied' if contactId is provided

---

### 6. Get Contact Statistics (Protected)
**GET** `/api/contact/stats`

Get statistics about contact messages.

**Access:** Private (HR, Admin, Super Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "total": 150,
        "new": 25,
        "read": 50,
        "replied": 75,
        "recentContacts": 12,
        "unreadCount": 25
    }
}
```

**Statistics Explained:**
- `total`: Total number of contacts in database
- `new`: Number of contacts with 'New' status
- `read`: Number of contacts with 'Read' status
- `replied`: Number of contacts with 'Replied' status
- `recentContacts`: Number of contacts in the last 7 days
- `unreadCount`: Same as 'new' (for convenience)

---

### 7. Delete Contact (Protected)
**DELETE** `/api/contact/:id`

Delete a contact message.

**Access:** Private (Admin, Super Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
    "success": true,
    "message": "Contact message deleted successfully"
}
```

**Note:** Only Admin and Super Admin can delete contacts. HR cannot delete.

---

## Error Responses

### 400 Bad Request
```json
{
    "success": false,
    "message": "Please provide name, email, and message"
}
```

### 401 Unauthorized
```json
{
    "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
    "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "Contact message not found"
}
```

### 500 Server Error
```json
{
    "success": false,
    "message": "Server Error",
    "error": "Error details..."
}
```

---

## Role-Based Access Control

| Endpoint | Public | HR | Admin | Super Admin |
|----------|--------|----|----|-------------|
| POST /api/contact | ✅ | ✅ | ✅ | ✅ |
| GET /api/contact | ❌ | ✅ | ✅ | ✅ |
| GET /api/contact/:id | ❌ | ✅ | ✅ | ✅ |
| PUT /api/contact/:id/status | ❌ | ✅ | ✅ | ✅ |
| POST /api/contact/reply | ❌ | ✅ | ✅ | ✅ |
| GET /api/contact/stats | ❌ | ✅ | ✅ | ✅ |
| DELETE /api/contact/:id | ❌ | ❌ | ✅ | ✅ |

---

## Usage Examples

### Example 1: Public Contact Submission
```javascript
// Frontend form submission
const submitContact = async (formData) => {
    const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message
        })
    });
    
    const data = await response.json();
    return data;
};
```

### Example 2: HR Viewing New Messages
```javascript
// Get all new contact messages
const getNewMessages = async (token) => {
    const response = await fetch('http://localhost:5000/api/contact?status=New', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    return data;
};
```

### Example 3: Admin Replying to Contact
```javascript
// Reply to a contact message
const replyToContact = async (token, contactId, replyData) => {
    const response = await fetch('http://localhost:5000/api/contact/reply', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contactId: contactId,
            email: replyData.email,
            subject: replyData.subject,
            message: replyData.message
        })
    });
    
    const data = await response.json();
    return data;
};
```

### Example 4: Dashboard Statistics
```javascript
// Get contact stats for dashboard
const getContactStats = async (token) => {
    const response = await fetch('http://localhost:5000/api/contact/stats', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    return data;
};
```

---

## Best Practices

1. **Email Notifications**: The system automatically sends email notifications when a new contact is submitted. Ensure `EMAIL_USER` is configured in your `.env` file.

2. **Status Management**: 
   - Use 'New' for unread messages
   - Messages automatically change to 'Read' when viewed
   - Manually set to 'Replied' after sending a response (or use the reply endpoint)

3. **Search & Filter**: Use the search parameter to find contacts by name, email, or subject for better organization.

4. **Pagination**: Always use pagination for large datasets to improve performance.

5. **Error Handling**: Always check the `success` field in responses to handle errors gracefully.

---

## Testing

You can test the endpoints using the seeded users:

**HR User:**
- Email: `hr@aarvion.com`
- Password: `HR@123`

**Admin User:**
- Email: `admin@aarvion.com`
- Password: `Admin@123`

**Super Admin:**
- Email: `superadmin@aarvion.com`
- Password: `SuperAdmin@123`
