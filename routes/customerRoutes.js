import express from "express";
import {
  addCustomer,
  addOrder,
  addPickup,
  addSchedulePickup,
  deletePickup,
  deleteSchedulePickup,
  getCustomers,
  getOrderTotalBill,
  getOrders,
  getPickups,
  getSchedulePickups,
} from "../controller/customerController.js";
const router = express.Router();

router.post("/addPickup", addPickup);
router.get("/getPickups", getPickups);
router.post("/addSchedulePickup", addSchedulePickup);
router.get("/getSchedulePickups", getSchedulePickups);
router.post("/addCustomer", addCustomer);
router.get("/getCustomers", getCustomers);
router.delete("/deletePickup/:id", deletePickup)
router.delete("/deleteSchedulePickup/:id", deleteSchedulePickup)

router.post('/addOrder', addOrder)
router.get('/getOrders/:number', getOrders)
router.get('/getOrderBill/:number', getOrderTotalBill)

export { router as default };
