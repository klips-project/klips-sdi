import express from 'express';

const router = express.Router();

import {
  getTemperatureCurve
} from '../../controllers/temperature_curve';

router.get('/api/temperature_curve/:region/:geomWKT/:threshold?', getTemperatureCurve);

export default router;
