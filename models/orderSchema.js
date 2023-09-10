import mongoose from 'mongoose';

const { Schema } = mongoose; // Use destructuring to access the Schema object

const itemSchema = new Schema({ // Use 'Schema' instead of 'mongoose.Schema'
    group: String,
    type: String,
    wearType: String,
    weight: Number,
    quantity: Number,
    price: Number // Use lowercase 'price' instead of 'Price'
});

const schema = new Schema({
    contactNo: String,
    customerName: String,
    address: String,
    items: [itemSchema],
    price: Number
}, { timestamps: true });

const order = mongoose.model('Order', schema); // Capitalize the model name
export default order;
