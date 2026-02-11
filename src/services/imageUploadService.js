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

// Configure storage for images
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Get file extension without the dot
        const fileExtension = path.extname(file.originalname).toLowerCase().replace('.', '');

        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const publicId = `image_${uniqueSuffix}`;

        console.log('\n📤 Cloudinary Image Upload Configuration:');
        console.log('  Original filename:', file.originalname);
        console.log('  Extension:', fileExtension);
        console.log('  Public ID:', publicId);
        console.log('  Resource type: image');

        return {
            folder: 'aarvionservices_cms',
            resource_type: 'image',
            public_id: publicId,
            format: fileExtension, // For images, format parameter works correctly
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [
                {
                    width: 2000,
                    height: 2000,
                    crop: 'limit', // Don't upscale, only downscale if needed
                    quality: 'auto:good' // Automatic quality optimization
                }
            ],
            // Preserve original filename in metadata
            context: {
                originalname: file.originalname
            }
        };
    }
});

// Configure multer with file validation
const uploadImage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for images
    },
    fileFilter: (req, file, cb) => {
        console.log('\n🔍 Image Validation:');
        console.log('  Filename:', file.originalname);
        console.log('  MIME type:', file.mimetype);

        // Check file extension
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        // Check MIME type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        console.log('  Extension:', fileExtension);

        if (allowedExtensions.includes(fileExtension) && allowedMimeTypes.includes(file.mimetype)) {
            console.log('  ✅ Image type valid');
            cb(null, true);
        } else {
            console.log('  ❌ Image type invalid');
            cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} image files are allowed.`));
        }
    }
});

module.exports = uploadImage;
