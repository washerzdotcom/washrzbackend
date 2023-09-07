import mongoose from 'mongoose';
const pickupSchema = mongoose.Schema;

const schema = new pickupSchema(
    {
        timeStamp: String,
        CustomerName: String,
        whatsappNo: String,
        address: String,
        slotPickupStatus: String
    },
    { timestamps: true }
)

const schedulePickup = mongoose.model('schedulePickup', schema);
export default schedulePickup;