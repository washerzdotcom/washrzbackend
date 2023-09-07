import customer from "../models/customerSchema.js";
import pickup from "../models/pickupSchema.js";
import schedulePickup from "../models/schedulePickup.js";
import AppError from "../utills/appError.js";
import catchAsync from "../utills/catchAsync.js";
export const addCustomer = catchAsync(async (req, res, next) => {
  const { name, address, mobile, date } = req.body;
  const socket = req.socket;
  if (!name || !address || !mobile || !date) {
    return next(new AppError("Please fill the all field", 404));
  }
  await customer.create({
    Name: name,
    Address: address,
    Phone: mobile,
    Date: date,
  });
  socket.emit("customeradded", { message: "customer added sucessfully" });
  res.status(200).json({
    message: "Customer Sucessfully Added",
  });
});

export const getCustomers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  // Use a single query to get both customers and count
  const [customers, countTotal] = await Promise.all([
    customer.find().skip(skip).limit(limit),
    customer.countDocuments(),
  ]);

  res.status(200).json({
    result: customers,
    total: countTotal,
    message: "Customers Retrieved Successfully",
  });
});

export const addPickup = catchAsync(async (req, res, next) => {
  const { name, contact, address } = req.body;
  console.log("0000>> ", { name, contact, address });
  await pickup.create({ Name: name, Contact: contact, Address: address });
  res.status(200).json({
    message: "Pickup Added Sucessfully",
  });
});

export const getPickups = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Use parseInt to ensure page and limit are numbers
  const limit = parseInt(req.query.limit) || 10;

  // Calculate the skip value once
  const skip = (page - 1) * limit;

  // Use a single query to get both pickups and count
  const [pickups, countTotal] = await Promise.all([
    pickup.find().skip(skip).limit(limit),
    pickup.countDocuments(),
  ]);

  res.status(200).json({
    Pickups: pickups,
    total: countTotal,
    message: "Pickup Retrieved Successfully",
  });
});

export const deletePickup = catchAsync(async (req, res, next) => {
  const pickupData = await pickup.findByIdAndDelete(req.params.id);
  if (!pickupData) {
    return next(new AppError("No pickup found with that ID", 404));
  }
  res.status(200).json({
    message: "Pickup Deleted Sucessfully",
  });
});

export const addSchedulePickup = catchAsync(async (req, res, next) => {
  const { customerName, whatsappNo, address, slot } =
    req.body;
  console.log("0000>> ", {
    customerName,
    whatsappNo,
    address,
    slot
  });
  await schedulePickup.create({
    customerName,
    whatsappNo,
    address,
    slot
  });
  res.status(200).json({
    message: "SchedulePickup Added Sucessfully",
  });
});

export const getSchedulePickups = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Use parseInt to ensure page and limit are numbers
  const limit = parseInt(req.query.limit) || 10;

  // Calculate the skip value once
  const skip = (page - 1) * limit;

  // Use a single query to get both pickups and count
  const [pickups, countTotal] = await Promise.all([
    schedulePickup.find().skip(skip).limit(limit),
    schedulePickup.countDocuments(),
  ]);

  res.status(200).json({
    Pickups: pickups,
    total: countTotal,
    message: "SchedulePickups Retrieved Successfully",
  });
});
