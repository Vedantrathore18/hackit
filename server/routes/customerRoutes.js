import express from 'express';
import {
  getCustomers,
  getCustomerLedger,
  createCustomer,
} from '../controllers/customerController.js';

const router = express.Router();

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.get('/:id/ledger', getCustomerLedger);

export default router;
