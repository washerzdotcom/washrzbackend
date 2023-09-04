import mongoose from 'mongoose';
const pickupSchema = mongoose.Schema;

const schema = new pickupSchema(
    {
        Name: String,
        Contact: String,
        Address: String,
    },
    { timestamps: true }
)

const pickup = mongoose.model('pickup', schema);
export default pickup;