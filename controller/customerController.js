import customer from '../models/customerSchema.js'
import pickup from '../models/pickupSchema.js';
import AppError from '../utills/appError.js';
import catchAsync from '../utills/catchAsync.js';
export const addCustomer = catchAsync(async (req, res, next) =>
{
     const {name, address, mobile, date} = req.body;
     if(!name || !address || ! mobile || !date)
     {
       return next(new AppError('Please fill the all field', 404))
     }
     await customer.create({Name: name, Address: address, Phone: mobile, Date: date});
     res.status(200).json({
        message: 'Customer Sucessfully Added'
     })
});

export const getCustomers = catchAsync(async (req, res, next) =>
{
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
     message: 'Customers Retrieved Successfully',
   });
});

export const addPickup = catchAsync(async (req, res, next) =>
{
     const {name, contact, address} = req.body;
     console.log("0000>> ", {name, contact, address})
     await pickup.create({Name: name, Contact: contact, Address: address})
     res.status(200).json({
        message: 'Pickup Added Sucessfully',
     })
});

//1.  export const getPickups = catchAsync(async (req, res, next) =>
// {
//      const page = req.query.page || 1;
//      const limit = req.query.limit || 10;
//      const skip = (page - 1) * limit;
//      const pickups = await pickup.find().skip(skip).limit(limit);
//      const countTotal = await pickups.find().count();
//      res.status(200).json({
//         Pickups: pickups,
//         total: countTotal,
//         message: 'Pickup Getted Sucessfully',
//      })
// });


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
    message: 'Pickup Retrieved Successfully',
  });
});

