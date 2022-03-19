import { authJwt } from "../middleware/index.js";
import { getFilteredData } from "../controllers/segmentation.controller.js";
import express from 'express';

const router = express.Router();

// router.get('/api/v1/filter/segment', async (req, res) => {
//   try {
//     const orders = "test";
//     res.send(orders)
//   } catch (error) {
//     res.send(error)
//   }
// })

router.post('/filter', getFilteredData)

export default router
