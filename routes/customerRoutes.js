import express from 'express';
import { addCustomer, getCustomers } from '../controller/customerController.js';
const router = express.Router();

router.post('/addCustomer', addCustomer);
router.get('/getCustomers', getCustomers);
export { router as default };