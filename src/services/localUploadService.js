const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../../temp/uploads');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('✅ Created temp uploads directory:', tempDir);
}

// Configure local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = `resume_${uniqueSuffix}${fileExtension}`;

        // Log the upload details
        console.log('\n📄 File Upload Details:');
        console.log('  Original Name:', file.originalname);
        console.log('  MIME Type:', file.mimetype);
        console.log('  Field Name:', file.fieldname);
        console.log('  Saved As:', fileName);
        console.log('  Saved To:', tempDir);

        cb(null, fileName);
    }
});

// Configure multer with file validation
const localUpload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('\n🔍 Validating File:');
        console.log('  Field Name:', file.fieldname);
        console.log('  Original Name:', file.originalname);
        console.log('  MIME Type:', file.mimetype);

        // Check file extension
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(fileExtension)) {
            console.log('  ✅ File type valid');
            cb(null, true);
        } else {
            console.log('  ❌ File type invalid');
            cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`));
        }
    }
});

module.exports = localUpload;
