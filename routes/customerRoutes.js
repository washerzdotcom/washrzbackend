import express from "express";
import {
  addCustomer,
  addPickup,
  addSchedulePickup,
  deletePickup,
  deleteSchedulePickup,
  getCustomers,
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

export { router as default };
