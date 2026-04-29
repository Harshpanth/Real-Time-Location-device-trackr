import { Router } from 'express';
import * as geo from '../controllers/geofence.controller.js';
import { protect } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';

const router = Router();
router.use(protect);
router.get('/', geo.getGeofences);
router.post('/', validate(schemas.geofence), geo.createGeofence);
router.put('/:id', geo.updateGeofence);
router.delete('/:id', geo.deleteGeofence);
export default router;
