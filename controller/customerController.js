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
    new APIFeatures(customer.find(), req.query).sort().limitFields().paginate()
      .query,
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
  const pickupData = await pickup.create({
    Name: name,
    Contact: contact,
    Address: address,
    type: 'live'
  });
  req.socket.emit("addPickup", pickupData);
  res.status(200).json({
    message: "Pickup Added Sucessfully",
  });
});

export const getPickups = catchAsync(async (req, res, next) => {
  const [pickups, countTotal] = await Promise.all([
    new APIFeatures(pickup.find({type: 'live', isDeleted: false}), req.query).sort().limitFields().paginate()
      .query,
    pickup.countDocuments({type: 'live', isDeleted: false}),
  ]);

  res.status(200).json({
    Pickups: pickups,
    total: countTotal,
    message: "Pickup Retrieved Successfully",
  });
});

export const deletePickup = catchAsync(async (req, res, next) => {
  const pickupData = await pickup.findByIdAndUpdate(req.params.id, {isDeleted: true});
  if (!pickupData) {
    return next(new AppError("No pickup found with that ID", 404));
  }
  res.status(200).json({
    message: "Pickup Deleted Sucessfully",
  });
});

export const addSchedulePickup = catchAsync(async (req, res, next) => {
  const { name, contact, address, slot } = req.body;
  const schedulePickupData = await pickup.create({
    Name: name,
    Contact: contact,
    Address: address,
    slot,
    type: 'schedule'
  });
  req.socket.emit("addSchedulePickup", schedulePickupData);
  res.status(200).json({
    message: "SchedulePickup Added Sucessfully",
  });
});

export const getSchedulePickups = catchAsync(async (req, res, next) => {
  const [pickups, countTotal] = await Promise.all([
    new APIFeatures(pickup.find({type: 'schedule',isDeleted: false}), req.query)
      .sort()
      .limitFields()
      .paginate().query,
      pickup.countDocuments({type: 'schedule',isDeleted: false}),
  ]);

  res.status(200).json({
    Pickups: pickups,
    total: countTotal,
    message: "SchedulePickups Retrieved Successfully",
  });
});

export const addOrder = catchAsync(async (req, res, next) => {
  const { contactNo, customerName, address, items, price } = req.body;
  const latestOrder =await order.find().sort({_id: -1})
  console.log("this is the latesoder---> ", latestOrder)
  let order_id = `WZ1001`
  if(latestOrder.length > 0)
  {
    order_id = ((latestOrder[0].order_id.split('WZ')[1]*1)+1);
    order_id = 'WZ'+order_id
    console.log("updated order id---> ", order_id)
  }
  await order.create({
    contactNo,
    customerName,
    address,
    items,
    price,
    order_id
  });
  res.status(200).json({
    message: "Order Added Sucessfully",
  });
});

export const getOrders = catchAsync(async (req, res, next) => {
  const status = req?.query?.status ?  {status: req?.query?.status} : {$or: [{status: 'intransit'}, {status: ''}]}
  const [orders, countTotal] = await Promise.all([
    new APIFeatures(order.find(status), req.query).sort().limitFields().paginate()
      .query,
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

export const getCancelPickups = catchAsync(async (req, res, next) => {
  const [pickups, countTotal] = await Promise.all([
    new APIFeatures(pickup.find({isDeleted: true}), req.query)
      .sort()
      .limitFields()
      .paginate().query,
      pickup.countDocuments({isDeleted: true}),
  ]);

  res.status(200).json({
    Pickups: pickups,
    total: countTotal,
    message: "Cancelled Pickups Retrieved Successfully",
  });
});

export const changeOrderStatus = catchAsync(async (req, res, next) =>
{
   const _id = req.params.id;
   const status = (req.body.status).toLowerCase();
   const updatedOrder = await order.findOneAndUpdate({_id}, {status});
   res.status(200).json({
    result: updatedOrder,
    message: `Added in ${status} tab`,
  });
})

