import mongoose from 'mongoose';
const customerSchema = mongoose.Schema;

const schema = new customerSchema(
    {
        Name: String,
        Phone: Number,
        Address: String,
    },
    { timestamps: true }
)

const customer = mongoose.model('order', schema);
module.exports = customer;