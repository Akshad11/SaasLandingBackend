# File Upload Troubleshooting Guide

## Common Error: MulterError: Unexpected field

### What This Error Means
This error occurs when the field name in your frontend form doesn't match what the backend expects.

---

## Quick Fix Checklist

### 1. Check Your Field Names

**Backend expects these field names:**

| Endpoint | Expected Field Name | Alternative | File Types |
|----------|-------------------|-------------|------------|
| `POST /api/upload` | `resume` | `file` | PDF, DOC, DOCX |
| `POST /api/upload/image` | `image` | - | JPG, PNG, JPEG, WEBP |
| `POST /api/upload/multiple` | `files` | - | PDF, DOC, DOCX (max 5) |

### 2. Frontend Examples

#### ✅ CORRECT - HTML Form
```html
<!-- For resume upload -->
<form action="/api/upload" method="POST" enctype="multipart/form-data">
    <input type="file" name="resume" accept=".pdf,.doc,.docx" />
    <button type="submit">Upload</button>
</form>

<!-- For image upload -->
<form action="/api/upload/image" method="POST" enctype="multipart/form-data">
    <input type="file" name="image" accept="image/*" />
    <button type="submit">Upload</button>
</form>
```

#### ✅ CORRECT - JavaScript/React
```javascript
// Resume upload
const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', file); // ✅ Field name is 'resume'
    
    const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
        // Don't set Content-Type header - browser will set it automatically
    });
    
    return await response.json();
};

// Image upload
const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file); // ✅ Field name is 'image'
    
    const response = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        body: formData
    });
    
    return await response.json();
};

// Multiple files upload
const uploadMultiple = async (files) => {
    const formData = new FormData();
    
    // Append each file with the same field name 'files'
    Array.from(files).forEach(file => {
        formData.append('files', file); // ✅ Field name is 'files'
    });
    
    const response = await fetch('http://localhost:5000/api/upload/multiple', {
        method: 'POST',
        body: formData
    });
    
    return await response.json();
};
```

#### ❌ WRONG - Common Mistakes
```javascript
// ❌ Wrong field name
formData.append('document', file); // Should be 'resume'
formData.append('photo', file);    // Should be 'image'
formData.append('file', file);     // Should be 'resume' (though 'file' works as fallback for /api/upload)

// ❌ Wrong Content-Type
fetch('/api/upload', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json' // ❌ Don't set this for file uploads
    },
    body: formData
});

// ❌ Stringifying FormData
fetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify(formData) // ❌ Don't stringify FormData
});
```

---

## Error Response Examples

### Unexpected Field Error
```json
{
    "success": false,
    "message": "Unexpected field. Expected field name: 'resume'. Please check your form field name.",
    "expectedField": "resume",
    "error": "UNEXPECTED_FIELD"
}
```

**Solution:** Change your form field name to match the expected field.

### No File Uploaded
```json
{
    "success": false,
    "message": "No file uploaded. Expected field name: \"resume\" or \"file\"",
    "hint": "Make sure your form field name matches \"resume\" or \"file\""
}
```

**Solution:** Ensure you're actually selecting and sending a file.

### File Size Too Large
```json
{
    "success": false,
    "message": "File size too large",
    "error": "LIMIT_FILE_SIZE"
}
```

**Solution:** Reduce file size or check backend limits.

---

## Testing Your Upload

### 1. Get Upload Info
```bash
curl http://localhost:5000/api/upload/info
```

This returns all available endpoints and their configurations.

### 2. Test with cURL

**Resume Upload:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "resume=@/path/to/your/resume.pdf"
```

**Image Upload:**
```bash
curl -X POST http://localhost:5000/api/upload/image \
  -F "image=@/path/to/your/image.jpg"
```

**Multiple Files:**
```bash
curl -X POST http://localhost:5000/api/upload/multiple \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.pdf"
```

### 3. Test with Postman

1. Set method to `POST`
2. Go to `Body` tab
3. Select `form-data`
4. Add key with correct field name (`resume`, `image`, or `files`)
5. Change type to `File`
6. Select your file
7. Send request

---

## React Component Example

```jsx
import React, { useState } from 'react';

function FileUpload() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file); // ✅ Correct field name

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            setResult(data);
            
            if (data.success) {
                alert('Upload successful!');
            } else {
                alert(`Upload failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
            />
            <button 
                onClick={handleUpload}
                disabled={uploading}
            >
                {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
            
            {result && (
                <div>
                    <h3>Result:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
```

---

## Debugging Steps

1. **Check the error message** - It will tell you the expected field name
2. **Verify your form field name** - Must match exactly
3. **Check Content-Type** - Should be `multipart/form-data` (browser sets this automatically)
4. **Inspect network request** - Use browser DevTools to see what's being sent
5. **Test with cURL or Postman** - Isolate frontend vs backend issues
6. **Check file format** - Ensure it matches accepted formats
7. **Visit `/api/upload/info`** - Get current configuration

---

## Still Having Issues?

### Check Backend Logs
The backend now provides detailed error messages. Check your terminal for:
```
Unhandled Error: MulterError: Unexpected field
```

The error will include which field was received and which was expected.

### Common Solutions

1. **Field name mismatch** - Change frontend field name to match backend
2. **Multiple upload instances** - Make sure you're not using multiple file inputs with different names
3. **Form not using FormData** - Always use FormData for file uploads
4. **Content-Type header set manually** - Remove it, let browser set it
5. **File input name attribute missing** - Add `name="resume"` to your input

---

## Configuration

If you need to change the expected field names, edit:
- `src/routes/upload.routes.js` - Change the field names in `upload.single('fieldName')`
- `src/services/uploadService.js` - Configure file types and storage
- `src/services/imageUploadService.js` - Configure image settings

---

## Success Response Format

```json
{
    "success": true,
    "message": "File uploaded successfully",
    "fileUrl": "https://res.cloudinary.com/your-cloud/...",
    "fileName": "resume_abc123.pdf"
}
```

Use the `fileUrl` to store or display the uploaded file.
