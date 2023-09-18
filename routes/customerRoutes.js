import express from "express";
import {
  addCustomer,
  addOrder,
  addPickup,
  addSchedulePickup,
  deletePickup,
  deleteSchedulePickup,
  getCancelPickup,
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
router.put("/deletePickup/:id", deletePickup)

router.post('/addOrder', addOrder)
router.get('/getOrders', getOrders)
router.get('/getOrderBill/:number', getOrderTotalBill)
router.get('/getCancelPickups', getCancelPickups)

export { router as default };
