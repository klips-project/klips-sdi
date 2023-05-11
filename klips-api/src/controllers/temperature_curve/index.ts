import express from 'express';
import { logger } from '../../logger';

const allowedRegions = ['dresden', 'langenfeld'];

export const getTemperatureCurve = async (req: express.Request, res: express.Response): Promise<express.Response> => {
  logger.info(req.params);
  if (!allowedRegions.includes(req.params.region)) {
    return res.status(404).send({ message: 'Region param not valid.'});
  }
  res.set('Content-Type', 'text/html');
  // TODO create chart
  return res.status(200).send(
    Buffer.from(`<h2>${req.params.region} Temperature</h2><br />
    <!-- dummy svg -->
      <svg viewBox="0 0 500 100" class="chart">
      <polyline
        fill="none"
        stroke="#0074d9"
        stroke-width="2"
        points="
          00,120
          20,60
          40,80
          60,20
          80,80
          100,80
          120,60
          140,100
          160,90
          180,80
          200, 110
          220, 10
          240, 70
          260, 100
          280, 100
          300, 40
          320, 0
          340, 100
          360, 100
          380, 120
          400, 60
          420, 70
          440, 80
        "
      />
      </svg>`
    ));
};
