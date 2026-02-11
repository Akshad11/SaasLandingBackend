const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for documents (PDF, DOC, DOCX)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Get file extension without the dot
        const fileExtension = path.extname(file.originalname).toLowerCase().replace('.', '');

        // Generate unique filename WITH extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const publicId = `resume_${uniqueSuffix}.${fileExtension}`;

        console.log('\n📤 Cloudinary Upload Configuration:');
        console.log('  Original filename:', file.originalname);
        console.log('  Extension:', fileExtension);
        console.log('  Public ID:', publicId);
        console.log('  Resource type: raw');

        return {
            folder: 'aarvionservices_resumes',
            resource_type: 'raw', // Critical for non-image files
            public_id: publicId, // Include extension in public_id for raw files
            // Don't specify format for raw files - it's determined by the file itself
            allowed_formats: ['pdf', 'doc', 'docx'],
            // Preserve original filename in metadata
            context: {
                originalname: file.originalname
            },
            // Use original filename for better organization
            use_filename: false, // We're using our own public_id
            unique_filename: false // We already made it unique
        };
    }
});

// Configure multer with file validation
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('\n🔍 File Validation:');
        console.log('  Filename:', file.originalname);
        console.log('  MIME type:', file.mimetype);

        // Check file extension
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        console.log('  Extension:', fileExtension);

        if (allowedExtensions.includes(fileExtension)) {
            console.log('  ✅ File type valid');
            cb(null, true);
        } else {
            console.log('  ❌ File type invalid');
            cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`));
        }
    }
});

module.exports = upload;
