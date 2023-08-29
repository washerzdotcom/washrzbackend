import mongoose from 'mongoose';
const orderSchema = mongoose.Schema;

const schema = new orderSchema(
    {
        orderNo: Number,
        name: String,
        Phone: Number,
        Address: String,
        status: {
            type: String,
            enum : ['Pending','Ready for Delivery'],
            default: 'Delivered'
        }
    },
    { timestamps: true }
)

const order = mongoose.model('order', schema);
module.exports = order;