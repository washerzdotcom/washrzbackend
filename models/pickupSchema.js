import mongoose from 'mongoose';
const pickupSchema = mongoose.Schema;

const schema = new pickupSchema(
    {
        Name: String,
        Contact: String,
        Address: String,
        slot: {type: String, default: 'NA'},
        PickupStatus: String,
        type: String,
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true }
)

const pickup = mongoose.model('pickup', schema);
export default pickup;