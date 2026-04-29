import { Router } from 'express';
import * as device from '../controllers/device.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = Router();
router.use(protect);
router.get('/', device.getDevices);
router.post('/', validate(schemas.device), device.createDevice);
router.get('/:id', device.getDevice);
router.put('/:id', device.updateDevice);
router.delete('/:id', device.deleteDevice);
export default router;
