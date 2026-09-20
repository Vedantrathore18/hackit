import express from 'express';
import {
  parseAndCreateTransaction,
  getTransactions,
  createManualTransaction,
} from '../controllers/transactionController.js';

const router = express.Router();

// The Hero Endpoint
router.post('/parse', parseAndCreateTransaction);

// Standard ledger endpoints
router.route('/')
  .get(getTransactions)
  .post(createManualTransaction);

export default router;
