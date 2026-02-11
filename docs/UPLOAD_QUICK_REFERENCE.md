# Upload API Quick Reference

## Endpoints

### 1. Resume/Document Upload
```
POST /api/upload
Field Name: 'resume' or 'file'
Formats: PDF, DOC, DOCX
```

**Example:**
```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);
fetch('/api/upload', { method: 'POST', body: formData });
```

---

### 2. Image Upload
```
POST /api/upload/image
Field Name: 'image'
Formats: JPG, PNG, JPEG, WEBP
```

**Example:**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
fetch('/api/upload/image', { method: 'POST', body: formData });
```

---

### 3. Multiple Files Upload
```
POST /api/upload/multiple
Field Name: 'files'
Max Files: 5
Formats: PDF, DOC, DOCX
```

**Example:**
```javascript
const formData = new FormData();
Array.from(files).forEach(file => formData.append('files', file));
fetch('/api/upload/multiple', { method: 'POST', body: formData });
```

---

### 4. Upload Info
```
GET /api/upload/info
Returns configuration and help
```

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `UNEXPECTED_FIELD` | Wrong field name | Use correct field name |
| `No file uploaded` | No file selected | Select a file first |
| `LIMIT_FILE_SIZE` | File too large | Reduce file size |

---

## Quick Test (cURL)

```bash
# Resume
curl -X POST http://localhost:5000/api/upload -F "resume=@file.pdf"

# Image
curl -X POST http://localhost:5000/api/upload/image -F "image=@photo.jpg"

# Info
curl http://localhost:5000/api/upload/info
```
