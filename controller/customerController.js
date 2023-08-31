import customer from '../models/customerSchema.js'
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
     const page = req.query.page || 1;
     const limit = req.query.limit || 10;
     const skip = (page - 1) * limit;
     const customers = await customer.find().skip(skip).limit(limit);
     res.status(200).json({
        result: customers,
        message: 'Customer Getting Sucessfully',
     })
});





