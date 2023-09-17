import customer from "../models/customerSchema.js";
import order from "../models/orderSchema.js";
import pickup from "../models/pickupSchema.js";
import schedulePickup from "../models/schedulePickup.js";
import APIFeatures from "../utills/apiFeatures.js";
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
  const [customers, countTotal] = await Promise.all([
    new APIFeatures(customer.find(), req.query).sort().limitFields().paginate().query,
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
  const pickupData = await pickup.create({ Name: name, Contact: contact, Address: address });
  req.socket.emit('addPickup', pickupData)
  res.status(200).json({
    message: "Pickup Added Sucessfully",
  });
});

export const getPickups = catchAsync(async (req, res, next) => {
  const [pickups, countTotal] = await Promise.all([
    new APIFeatures(pickup.find(), req.query).sort().limitFields().paginate().query,
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
  const { customerName, whatsappNo, address, slot } = req.body;
  const schedulePickupData = await schedulePickup.create({
    customerName,
    whatsappNo,
    address,
    slot,
  });
  req.socket.emit('addSchedulePickup', schedulePickupData)
  res.status(200).json({
    message: "SchedulePickup Added Sucessfully",
  });
});

export const getSchedulePickups = catchAsync(async (req, res, next) => {
  const [pickups, countTotal] = await Promise.all([
    new APIFeatures(schedulePickup.find(), req.query).sort().limitFields().paginate().query,
    schedulePickup.countDocuments(),
  ]);

  res.status(200).json({
    Pickups: pickups,
    total: countTotal,
    message: "SchedulePickups Retrieved Successfully",
  });
});

export const deleteSchedulePickup = catchAsync(async (req, res, next) => {
  const pickupData = await schedulePickup.findByIdAndDelete(req.params.id);
  if (!pickupData) {
    return next(new AppError("No pickup found with that ID", 404));
  }
  res.status(200).json({
    message: "Schedule Pickup Deleted Sucessfully",
  });
});

export const addOrder = catchAsync(async (req, res, next) => {
  const { contactNo, customerName, address, items, price } = req.body;
  await order.create({
    contactNo,
    customerName,
    address,
    items,
    price,
  });
  res.status(200).json({
    message: "Order Added Sucessfully",
  });
});

export const getOrders = catchAsync(async (req, res, next) => {
  const [orders, countTotal] = await Promise.all([
    new APIFeatures(order.find(), req.query).sort().limitFields().paginate().query,
    order.countDocuments(),
  ]);

  res.status(200).json({
    orders: orders,
    total: countTotal,
    message: "orders Retrieved Successfully",
  });
});

export const getOrderTotalBill = catchAsync(async (req, res, next) => {
  const Price = await order
    .findOne({
      contactNo: req.params.number,
    })
    .select("price -_id");

  return res.status(200).json({
    Price,
    message: "Price Retrieved Successfully",
  });
});
