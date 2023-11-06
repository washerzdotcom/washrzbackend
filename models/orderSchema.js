import mongoose from 'mongoose';

const { Schema } = mongoose; // Use destructuring to access the Schema object

const itemSchema = new Schema({ // Use 'Schema' instead of 'mongoose.Schema'
    heading: String,
    subHeading: String,
    viewPrice: String,
    quantity: Number,
    price: Number,
    newQtyPrice: Number // Use lowercase 'price' instead of 'Price'
});

const schema = new Schema({
    contactNo: String,
    customerName: String,
    address: String,
    items: [itemSchema],
    price: Number,
    order_id: String,
    status: {type: String, default: 'intransit'}
}, { timestamps: true });

const order = mongoose.model('Order', schema); // Capitalize the model name
export default order;
