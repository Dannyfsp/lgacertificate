import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/responseUtils';
import statesData from '../services/states.json';

const UtilController = {
  getAllStates: (req: Request, res: Response) => {
    try {
      const states = Object.keys(statesData);
      return successResponse(res, 'All States retrieved', states);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  },

  getLGA: (req: Request, res: Response) => {
    try {
      const state = req.query.state;

      const lgas = statesData[state as keyof typeof statesData];
      if (!lgas) {
        return res.status(404).json({ error: 'State not found' });
      }
      const states = Object.keys(statesData);
      return successResponse(res, 'LGAs retrieved', { state, lgas });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  },
};

export default UtilController;
