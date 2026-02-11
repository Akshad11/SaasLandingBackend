const express = require('express');
const router = express.Router();
const uploadImage = require('../services/imageUploadService');
const upload = require('../services/uploadService');
const localUpload = require('../services/localUploadService');

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
    if (err) {
        if (err.name === 'MulterError') {
            if (err.code === 'UNEXPECTED_FIELD') {
                return res.status(400).json({
                    success: false,
                    message: `Unexpected field. Expected field name: '${err.field}'. Please check your form field name.`,
                    expectedField: err.field,
                    error: 'UNEXPECTED_FIELD'
                });
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Maximum size is 10MB for documents and 5MB for images.',
                    error: 'LIMIT_FILE_SIZE'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message,
                error: err.code
            });
        }
        // Handle file filter errors (invalid file type)
        if (err.message && err.message.includes('Invalid file type')) {
            return res.status(400).json({
                success: false,
                message: err.message,
                error: 'INVALID_FILE_TYPE'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'File upload error',
            error: err.message
        });
    }
    next();
};

// @route   POST /api/upload
// @desc    Upload resume/document (PDF, DOC, DOCX)
// @access  Public
// Expected field name: 'resume' or 'file'
router.post('/', (req, res) => {
    // Try 'resume' first, then 'file' as fallback
    const uploadMiddleware = upload.single('resume');

    uploadMiddleware(req, res, (err) => {
        if (err) {
            // If error is unexpected field and field is 'file', try again with 'file'
            if (err.code === 'UNEXPECTED_FIELD' && err.field === 'file') {
                const fileUpload = upload.single('file');
                return fileUpload(req, res, (err2) => {
                    if (err2) {
                        return handleMulterError(err2, req, res, () => { });
                    }
                    if (!req.file) {
                        return res.status(400).json({
                            success: false,
                            message: 'No file uploaded'
                        });
                    }
                    return res.status(200).json({
                        success: true,
                        message: 'File uploaded successfully',
                        fileUrl: req.file.path,
                        fileName: req.file.filename || req.file.originalname
                    });
                });
            }
            return handleMulterError(err, req, res, () => { });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Expected field name: "resume" or "file"',
                hint: 'Make sure your form field name matches "resume" or "file"'
            });
        }

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            fileUrl: req.file.path,
            fileName: req.file.filename || req.file.originalname
        });
    });
});

// @route   POST /api/upload/image
// @desc    Upload image (JPG, PNG, JPEG, WEBP)
// @access  Public/Protected (depending on use case)
// Expected field name: 'image'
router.post('/image', (req, res) => {
    const uploadMiddleware = uploadImage.single('image');

    uploadMiddleware(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, () => { });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image uploaded. Expected field name: "image"',
                hint: 'Make sure your form field name is "image"'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: req.file.path,
            fileName: req.file.filename || req.file.originalname
        });
    });
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Public
// Expected field name: 'files'
router.post('/multiple', (req, res) => {
    const uploadMiddleware = upload.array('files', 5); // Max 5 files

    uploadMiddleware(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, () => { });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded. Expected field name: "files"',
                hint: 'Make sure your form field name is "files" and supports multiple files'
            });
        }

        const fileUrls = req.files.map(file => ({
            url: file.path,
            fileName: file.filename || file.originalname
        }));

        res.status(200).json({
            success: true,
            message: `${req.files.length} file(s) uploaded successfully`,
            files: fileUrls
        });
    });
});

// @route   GET /api/upload/info
// @desc    Get upload configuration info
// @access  Public
router.get('/info', (req, res) => {
    res.status(200).json({
        success: true,
        endpoints: {
            resume: {
                url: '/api/upload',
                method: 'POST',
                fieldName: 'resume',
                alternativeFieldName: 'file',
                acceptedFormats: ['pdf', 'doc', 'docx'],
                description: 'Upload resume or document files'
            },
            image: {
                url: '/api/upload/image',
                method: 'POST',
                fieldName: 'image',
                acceptedFormats: ['jpg', 'png', 'jpeg', 'webp'],
                description: 'Upload image files'
            },
            multiple: {
                url: '/api/upload/multiple',
                method: 'POST',
                fieldName: 'files',
                maxFiles: 5,
                acceptedFormats: ['pdf', 'doc', 'docx'],
                description: 'Upload multiple files'
            }
        },
        tips: [
            'Make sure the form field name matches the expected field name',
            'Use FormData in JavaScript to send files',
            'Set Content-Type to multipart/form-data',
            'Check file format before uploading'
        ]
    });
});

// ============================================
// DEBUG ROUTES - Save files locally for testing
// ============================================

// @route   POST /api/upload/debug
// @desc    Upload file to local temp folder (for debugging)
// @access  Public
router.post('/debug', (req, res) => {
    console.log('\n🐛 DEBUG UPLOAD STARTED');
    console.log('Headers:', req.headers);

    const uploadMiddleware = localUpload.single('resume');

    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.log('❌ Upload Error:', err.message);
            return handleMulterError(err, req, res, () => { });
        }

        if (!req.file) {
            console.log('❌ No file received');
            console.log('Request body:', req.body);
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Expected field name: "resume"',
                hint: 'Check that your form field name is "resume"',
                receivedFields: Object.keys(req.body)
            });
        }

        console.log('✅ File saved successfully!');
        console.log('File details:', {
            originalName: req.file.originalname,
            savedName: req.file.filename,
            size: req.file.size,
            path: req.file.path
        });

        res.status(200).json({
            success: true,
            message: 'File uploaded to local temp folder successfully',
            file: {
                originalName: req.file.originalname,
                savedName: req.file.filename,
                size: req.file.size,
                sizeKB: (req.file.size / 1024).toFixed(2),
                sizeMB: (req.file.size / (1024 * 1024)).toFixed(2),
                path: req.file.path,
                mimetype: req.file.mimetype
            },
            instructions: [
                'File saved locally for inspection',
                `Check: ${req.file.path}`,
                'Open the file to verify it is not corrupted',
                'If file is good, frontend is sending correctly'
            ]
        });
    });
});

// @route   POST /api/upload/debug-any
// @desc    Upload file with any field name (for debugging field name issues)
// @access  Public
router.post('/debug-any', (req, res) => {
    console.log('\n🐛 DEBUG ANY FIELD UPLOAD STARTED');
    console.log('Headers:', req.headers);

    const uploadMiddleware = localUpload.any(); // Accept any field name

    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.log('❌ Upload Error:', err.message);
            return handleMulterError(err, req, res, () => { });
        }

        if (!req.files || req.files.length === 0) {
            console.log('❌ No files received');
            console.log('Request body:', req.body);
            return res.status(400).json({
                success: false,
                message: 'No files uploaded',
                receivedFields: Object.keys(req.body),
                hint: 'Make sure you are sending a file in the request'
            });
        }

        const file = req.files[0];
        console.log('✅ File saved successfully!');
        console.log('Field name used:', file.fieldname);
        console.log('File details:', {
            originalName: file.originalname,
            savedName: file.filename,
            size: file.size,
            path: file.path
        });

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            detectedFieldName: file.fieldname,
            expectedFieldName: 'resume',
            fieldNameMatch: file.fieldname === 'resume',
            file: {
                originalName: file.originalname,
                savedName: file.filename,
                size: file.size,
                sizeKB: (file.size / 1024).toFixed(2),
                sizeMB: (file.size / (1024 * 1024)).toFixed(2),
                path: file.path,
                mimetype: file.mimetype
            },
            instructions: [
                'File saved locally for inspection',
                `Check: ${file.path}`,
                file.fieldname === 'resume'
                    ? '✅ Field name is correct!'
                    : `❌ Field name should be "resume" but is "${file.fieldname}"`,
                'Open the file to verify it is not corrupted'
            ]
        });
    });
});

// @route   GET /api/upload/debug-info
// @desc    Get debug information about upload configuration
// @access  Public
router.get('/debug-info', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const tempDir = path.join(__dirname, '../../temp/uploads');

    let files = [];
    let tempDirExists = false;

    try {
        if (fs.existsSync(tempDir)) {
            tempDirExists = true;
            files = fs.readdirSync(tempDir).map(filename => {
                const filePath = path.join(tempDir, filename);
                const stats = fs.statSync(filePath);
                return {
                    filename,
                    size: stats.size,
                    sizeKB: (stats.size / 1024).toFixed(2),
                    sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
                    created: stats.birthtime,
                    modified: stats.mtime,
                    path: filePath
                };
            });
        }
    } catch (error) {
        console.error('Error reading temp directory:', error);
    }

    res.status(200).json({
        success: true,
        tempDirectory: {
            path: tempDir,
            exists: tempDirExists,
            fileCount: files.length
        },
        files: files,
        debugEndpoints: {
            'POST /api/upload/debug': 'Upload with field name "resume" (saves locally)',
            'POST /api/upload/debug-any': 'Upload with any field name (saves locally)',
            'GET /api/upload/debug-info': 'Get this debug information'
        },
        instructions: [
            '1. Use /api/upload/debug to test with field name "resume"',
            '2. Use /api/upload/debug-any to test with any field name',
            '3. Files are saved to temp/uploads directory',
            '4. Check the saved files to verify they are not corrupted',
            '5. If files are good locally, the issue is with Cloudinary upload'
        ]
    });
});

module.exports = router;
