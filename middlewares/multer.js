import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(), // Store file in memory
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            cb(null, true);
        } else {
            cb(new Error('Only .xlsx files are allowed!'), false);
        }
    },
});

export const uploadMiddleware = upload.single('file');
