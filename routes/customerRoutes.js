import express from "express";
import {
  addCustomer,
  addPickup,
  getCustomers,
  getPickups,
} from "../controller/customerController.js";
const router = express.Router();

router.post("/addPickup", addPickup);
router.get("/getPickups", getPickups);
router.post("/addCustomer", addCustomer);
router.get("/getCustomers", getCustomers);
export { router as default };
