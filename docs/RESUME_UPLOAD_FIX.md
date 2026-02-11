# Resume Upload Corruption Fix - Documentation

## Problem
Resume files (PDF, DOC, DOCX) were getting corrupted when uploaded to Cloudinary.

## Root Causes Identified

1. **Incorrect params configuration** - Was using static object instead of async function
2. **Missing format specification** - Cloudinary needs explicit format for raw files
3. **No public_id generation** - Files were overwriting each other
4. **Missing file validation** - No checks for file type or size
5. **Improper resource_type handling** - Not consistently set to 'raw' for documents

## Solutions Implemented

### 1. Fixed Upload Service (`uploadService.js`)

#### Before (Corrupted Files):
```javascript
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'aarvionservices_resumes',
        allowed_formats: ['pdf', 'doc', 'docx'],
        resource_type: 'raw'
    }
});
```

#### After (Working Correctly):
```javascript
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const publicId = `resume_${uniqueSuffix}`;
        
        return {
            folder: 'aarvionservices_resumes',
            resource_type: 'raw', // Critical for PDFs
            public_id: publicId,
            format: fileExtension.replace('.', ''),
            allowed_formats: ['pdf', 'doc', 'docx'],
            context: {
                originalname: file.originalname
            }
        };
    }
});
```

### 2. Added File Validation

```javascript
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`));
        }
    }
});
```

### 3. Enhanced Error Handling

Now provides clear error messages for:
- Invalid file types
- File size exceeded
- Upload failures

## Key Changes Explained

### 1. Async Params Function
**Why:** Cloudinary needs dynamic configuration per file upload
```javascript
params: async (req, file) => { ... }
```

### 2. Explicit Format
**Why:** Prevents Cloudinary from trying to process/convert the file
```javascript
format: fileExtension.replace('.', '') // 'pdf', 'doc', 'docx'
```

### 3. Unique Public ID
**Why:** Prevents files from overwriting each other
```javascript
const publicId = `resume_${Date.now()}-${Math.round(Math.random() * 1E9)}`;
```

### 4. Resource Type 'raw'
**Why:** Tells Cloudinary to store as-is without processing
```javascript
resource_type: 'raw'
```

### 5. Preserve Original Filename
**Why:** Keep track of the original filename in metadata
```javascript
context: {
    originalname: file.originalname
}
```

## File Size Limits

- **Documents (PDF, DOC, DOCX)**: 10MB
- **Images (JPG, PNG, WEBP)**: 5MB

## Supported Formats

### Documents
- `.pdf` - PDF files
- `.doc` - Microsoft Word (old format)
- `.docx` - Microsoft Word (new format)

### Images
- `.jpg` / `.jpeg` - JPEG images
- `.png` - PNG images
- `.webp` - WebP images

## Testing the Fix

### 1. Upload a Resume
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "resume=@/path/to/resume.pdf"
```

**Expected Response:**
```json
{
    "success": true,
    "message": "File uploaded successfully",
    "fileUrl": "https://res.cloudinary.com/.../resume_1234567890.pdf",
    "fileName": "resume_1234567890.pdf"
}
```

### 2. Verify File in Cloudinary
1. Go to your Cloudinary dashboard
2. Navigate to Media Library
3. Open folder: `aarvionservices_resumes`
4. Download the file and verify it opens correctly

### 3. Test File Validation

**Test invalid file type:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "resume=@/path/to/file.txt"
```

**Expected Error:**
```json
{
    "success": false,
    "message": "Invalid file type. Only .pdf, .doc, .docx files are allowed.",
    "error": "INVALID_FILE_TYPE"
}
```

**Test file too large:**
```bash
# Upload a file larger than 10MB
```

**Expected Error:**
```json
{
    "success": false,
    "message": "File size too large. Maximum size is 10MB for documents and 5MB for images.",
    "error": "LIMIT_FILE_SIZE"
}
```

## Frontend Integration

### React Example
```javascript
const uploadResume = async (file) => {
    // Validate file size before uploading
    if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Maximum size is 10MB');
        return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
        return;
    }
    
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
        const response = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('File uploaded:', data.fileUrl);
            // Save the fileUrl to your database
            return data.fileUrl;
        } else {
            console.error('Upload failed:', data.message);
            alert(data.message);
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed. Please try again.');
    }
};
```

## Verifying File Integrity

### 1. Download from Cloudinary
After upload, download the file from the returned URL and verify:
- File opens correctly
- Content is readable
- No corruption

### 2. Check File Metadata
In Cloudinary dashboard:
- Check file size matches original
- Verify format is correct
- Check context for original filename

## Common Issues & Solutions

### Issue: Files still corrupted
**Solution:** 
- Ensure `resource_type: 'raw'` is set
- Check that format is explicitly specified
- Verify Cloudinary credentials are correct

### Issue: Files overwriting each other
**Solution:**
- Ensure unique public_id is generated
- Check that params is an async function

### Issue: Upload fails silently
**Solution:**
- Check Cloudinary credentials in `.env`
- Verify network connectivity
- Check Cloudinary account limits

### Issue: Wrong file type uploaded
**Solution:**
- Frontend validation is implemented
- Backend fileFilter will reject invalid types
- User will see clear error message

## Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Migration Guide

If you have existing corrupted files:

1. **Re-upload all resumes** using the fixed endpoint
2. **Update database records** with new file URLs
3. **Delete old corrupted files** from Cloudinary
4. **Test downloads** to ensure files work correctly

## Performance Optimizations

1. **File size limits** prevent large uploads
2. **Format validation** happens before upload
3. **Unique filenames** prevent conflicts
4. **Metadata preservation** for tracking

## Security Considerations

1. **File type validation** prevents malicious uploads
2. **File size limits** prevent DoS attacks
3. **Unique public IDs** prevent file enumeration
4. **No executable files** allowed

## Monitoring

To monitor upload health:

1. Check Cloudinary dashboard for:
   - Upload success rate
   - Storage usage
   - Bandwidth usage

2. Monitor backend logs for:
   - Upload errors
   - File validation failures
   - Cloudinary API errors

## Summary

✅ **Fixed:** Async params function for proper configuration
✅ **Fixed:** Explicit format specification
✅ **Fixed:** Unique public_id generation
✅ **Added:** File validation (type and size)
✅ **Added:** Better error handling
✅ **Added:** Metadata preservation
✅ **Improved:** Image upload service consistency

Files should now upload correctly without corruption!
