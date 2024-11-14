import mongoose from "mongoose";
const pickupSchema = mongoose.Schema;

const schema = new pickupSchema(
  {
    Name: String,
    Contact: String,
    Address: String,
    slot: { type: String, default: "NA" },
    PickupStatus: { type: String, default: "pending" },
    type: { type: String, default: "regular" },
    isDeleted: { type: Boolean, default: false },
    rescheduledDate: { type: Date, default: null }, // Add rescheduled date
    isRescheduled: { type: Boolean, default: false }, // Flag to check if rescheduled
    cancelNote: { type: String },
    cancelVoice: { type: String },
    plantName: { type: String },
    riderName: String,
  },
  { timestamps: true }
);

const pickup = mongoose.model("pickup", schema);
export default pickup;
