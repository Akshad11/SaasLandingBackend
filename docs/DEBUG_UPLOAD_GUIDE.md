# Debug Upload Guide

## Overview
This guide helps you debug file upload issues by saving files locally to verify the frontend is sending them correctly.

## Debug Endpoints

### 1. POST /api/upload/debug
Saves uploaded file to local temp folder with field name "resume"

**Usage:**
```bash
curl -X POST http://localhost:5000/api/upload/debug -F "resume=@yourfile.pdf"
```

**Response:**
```json
{
    "success": true,
    "message": "File uploaded to local temp folder successfully",
    "file": {
        "originalName": "yourfile.pdf",
        "savedName": "resume_1234567890.pdf",
        "size": 245678,
        "sizeKB": "239.92",
        "sizeMB": "0.23",
        "path": "G:\\...\\backend\\temp\\uploads\\resume_1234567890.pdf",
        "mimetype": "application/pdf"
    },
    "instructions": [
        "File saved locally for inspection",
        "Check: G:\\...\\backend\\temp\\uploads\\resume_1234567890.pdf",
        "Open the file to verify it is not corrupted",
        "If file is good, frontend is sending correctly"
    ]
}
```

---

### 2. POST /api/upload/debug-any
Accepts ANY field name - useful for debugging field name issues

**Usage:**
```bash
# Works with any field name
curl -X POST http://localhost:5000/api/upload/debug-any -F "document=@yourfile.pdf"
curl -X POST http://localhost:5000/api/upload/debug-any -F "file=@yourfile.pdf"
curl -X POST http://localhost:5000/api/upload/debug-any -F "resume=@yourfile.pdf"
```

**Response:**
```json
{
    "success": true,
    "message": "File uploaded successfully",
    "detectedFieldName": "document",
    "expectedFieldName": "resume",
    "fieldNameMatch": false,
    "file": { ... },
    "instructions": [
        "File saved locally for inspection",
        "Check: G:\\...\\backend\\temp\\uploads\\resume_1234567890.pdf",
        "❌ Field name should be \"resume\" but is \"document\"",
        "Open the file to verify it is not corrupted"
    ]
}
```

---

### 3. GET /api/upload/debug-info
Get information about uploaded files in temp folder

**Usage:**
```bash
curl http://localhost:5000/api/upload/debug-info
```

**Response:**
```json
{
    "success": true,
    "tempDirectory": {
        "path": "G:\\...\\backend\\temp\\uploads",
        "exists": true,
        "fileCount": 3
    },
    "files": [
        {
            "filename": "resume_1234567890.pdf",
            "size": 245678,
            "sizeKB": "239.92",
            "sizeMB": "0.23",
            "created": "2026-02-11T17:45:00.000Z",
            "modified": "2026-02-11T17:45:00.000Z",
            "path": "G:\\...\\backend\\temp\\uploads\\resume_1234567890.pdf"
        }
    ],
    "debugEndpoints": { ... },
    "instructions": [ ... ]
}
```

---

## Debugging Workflow

### Step 1: Test with Debug Endpoint
```bash
curl -X POST http://localhost:5000/api/upload/debug -F "resume=@yourfile.pdf"
```

### Step 2: Check Console Output
The server will log detailed information:
```
🐛 DEBUG UPLOAD STARTED
Headers: { ... }
🔍 Validating File:
  Field Name: resume
  Original Name: yourfile.pdf
  MIME Type: application/pdf
  ✅ File type valid
📄 File Upload Details:
  Original Name: yourfile.pdf
  MIME Type: application/pdf
  Field Name: resume
  Saved As: resume_1234567890.pdf
  Saved To: G:\...\backend\temp\uploads
✅ File saved successfully!
```

### Step 3: Verify File Locally
1. Navigate to `backend/temp/uploads/`
2. Find your uploaded file
3. Open it to verify it's not corrupted
4. Check file size matches original

### Step 4: Interpret Results

**✅ If file is good locally:**
- Frontend is sending correctly
- Issue is with Cloudinary upload
- Check Cloudinary credentials
- Verify Cloudinary service configuration

**❌ If file is corrupted locally:**
- Frontend is sending corrupted data
- Check frontend file reading logic
- Verify FormData is created correctly
- Check for any preprocessing/compression

**❌ If no file received:**
- Check field name (use `/debug-any` to detect)
- Verify Content-Type is multipart/form-data
- Check file is actually selected
- Verify FormData.append() is called

---

## Frontend Testing Examples

### React Example
```javascript
const testUpload = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    // Test with debug endpoint first
    const response = await fetch('http://localhost:5000/api/upload/debug', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    console.log('Debug response:', data);
    
    if (data.success) {
        console.log('✅ File saved to:', data.file.path);
        console.log('📊 File size:', data.file.sizeMB, 'MB');
        console.log('📝 Instructions:', data.instructions);
    }
};
```

### Vanilla JavaScript
```javascript
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('resume', file);

fetch('http://localhost:5000/api/upload/debug', {
    method: 'POST',
    body: formData
})
.then(res => res.json())
.then(data => {
    console.log('Upload result:', data);
    if (data.success) {
        alert(`File saved! Check: ${data.file.path}`);
    }
});
```

---

## Common Issues & Solutions

### Issue 1: "No file uploaded"
**Symptoms:**
```json
{
    "success": false,
    "message": "No file uploaded. Expected field name: \"resume\""
}
```

**Solutions:**
1. Check field name is exactly "resume"
2. Verify file is selected: `fileInput.files[0]`
3. Check FormData: `formData.append('resume', file)`
4. Use `/debug-any` to detect actual field name

---

### Issue 2: Wrong field name detected
**Symptoms:**
```json
{
    "detectedFieldName": "document",
    "expectedFieldName": "resume",
    "fieldNameMatch": false
}
```

**Solution:**
Change frontend code to use "resume":
```javascript
// ❌ Wrong
formData.append('document', file);

// ✅ Correct
formData.append('resume', file);
```

---

### Issue 3: File corrupted locally
**Symptoms:**
- File saves but won't open
- File size is wrong
- Content is garbled

**Solutions:**
1. Check frontend isn't preprocessing file
2. Verify no compression/encoding
3. Check file reading logic
4. Ensure binary data is preserved

---

### Issue 4: File good locally but corrupted in Cloudinary
**Symptoms:**
- Local file opens fine
- Cloudinary file is corrupted

**Solutions:**
1. Check Cloudinary configuration
2. Verify `resource_type: 'raw'`
3. Check format specification
4. Verify Cloudinary credentials

---

## Temp Folder Location

Files are saved to:
```
backend/temp/uploads/
```

**Note:** This folder is in `.gitignore` and won't be committed.

---

## Console Logging

The debug endpoints provide detailed console output:

```
🐛 DEBUG UPLOAD STARTED
Headers: {
  'content-type': 'multipart/form-data; boundary=...',
  'content-length': '245678',
  ...
}

🔍 Validating File:
  Field Name: resume
  Original Name: test-resume.pdf
  MIME Type: application/pdf
  ✅ File type valid

📄 File Upload Details:
  Original Name: test-resume.pdf
  MIME Type: application/pdf
  Field Name: resume
  Saved As: resume_1707674400000-123456789.pdf
  Saved To: G:\...\backend\temp\uploads

✅ File saved successfully!
File details: {
  originalName: 'test-resume.pdf',
  savedName: 'resume_1707674400000-123456789.pdf',
  size: 245678,
  path: 'G:\\...\\backend\\temp\\uploads\\resume_1707674400000-123456789.pdf'
}
```

---

## Cleanup

To clean up test files:

**Windows:**
```bash
rmdir /s /q temp\uploads
```

**Linux/Mac:**
```bash
rm -rf temp/uploads
```

The folder will be recreated automatically on next upload.

---

## Production Use

**⚠️ Important:** These debug endpoints are for development only!

Before deploying to production:
1. Remove or disable debug endpoints
2. Or add authentication to debug routes
3. Consider environment-based routing

```javascript
// Example: Only enable in development
if (process.env.NODE_ENV === 'development') {
    router.post('/debug', ...);
    router.post('/debug-any', ...);
    router.get('/debug-info', ...);
}
```

---

## Summary

1. **Use `/api/upload/debug`** - Test with correct field name
2. **Use `/api/upload/debug-any`** - Detect field name issues
3. **Use `/api/upload/debug-info`** - View uploaded files
4. **Check console logs** - Detailed upload information
5. **Verify local files** - Ensure files aren't corrupted
6. **Compare with Cloudinary** - Identify where corruption occurs

This helps isolate whether the issue is:
- ✅ Frontend sending correctly → Cloudinary issue
- ❌ Frontend sending corrupted → Frontend issue
- ❌ Wrong field name → Configuration issue
