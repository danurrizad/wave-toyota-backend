import express from 'express'
import { getGentaniAll, getGentaniById, createGentani, createGentaniByUpload, updateGentani, deleteGentani } from '../controllers/GentaniController.js';
import { uploadMiddleware } from '../middlewares/multer.js';
import { validateHeaders } from '../middlewares/uploadGentani.js';

const router = express.Router();

router.get('/gentani', getGentaniAll);
router.get('/gentani/:id', getGentaniById);
router.post('/gentani', createGentani);
router.post('/gentani/upload', uploadMiddleware, validateHeaders, createGentaniByUpload);
router.put('/gentani/:gentaniId', updateGentani);
router.delete('/gentani/:gentaniId', deleteGentani);
// router.put('/gentani-material/:gentaniId', setGentaniMaterial);

export default router;
