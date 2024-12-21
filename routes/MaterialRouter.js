import express from 'express'
import { getMaterialAll, getMaterialById, createMaterial, updateMaterial, deleteMaterial } from '../controllers/MaterialController.js';

const router = express.Router();

router.get('/material', getMaterialAll);
router.get('/material/:id', getMaterialById);
router.post('/material', createMaterial);
router.put('/material/:materialNo', updateMaterial);
router.delete('/material/:materialNo/:plant', deleteMaterial);

// router.get('/material-no-gentani', getMaterialNoGentani);
// router.put('/material-no-gentani/:materialNo', setMaterialNoGentani);

export default router;
