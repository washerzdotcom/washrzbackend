import Order from "../models/orderSchema.js";
import Pickup from "../models/pickupSchema.js";
import Plant from "../models/plantSchema.js";
import User from "../models/userModel.js";

// Create a new plant
export const addPlant = async (req, res) => {
  try {
    const { name, location } = req.body;

    // Check if the plant already exists
    const existingPlant = await Plant.findOne({ name });
    if (existingPlant) {
      return res.status(400).json({ error: "Plant already exists." });
    }

    // Create a new plant with the name and location
    const plant = new Plant({ name, location });
    await plant.save();

    res.status(201).json({ message: "Plant added successfully", plant });
  } catch (error) {
    res.status(500).json({ error: "Server error, please try again." });
  }
};

// Fetch all plants
export const getAllPlants = async (req, res) => {
  try {
    const plants = await Plant.find(); // Retrieve all plant documents from the database
    res.status(200).json(plants);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch plants, please try again." });
  }
};

// Delete a plant by ID
export const deletePlant = async (req, res) => {
  try {
    const plantId = req.params.id;

    // Find the plant by ID and remove it
    const deletedPlant = await Plant.findByIdAndDelete(plantId);

    if (!deletedPlant) {
      return res.status(404).json({ error: "Plant not found." });
    }

    res.status(200).json({ message: "Plant deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete plant. Please try again." });
  }
};

// export const assignPlant = async (req, res) => {
//   const { pickupId } = req.params;
//   const { plantId } = req.body;

//   try {
//     // Update the Pickup document with the selected plant
//     const updatedPickup = await Pickup.findByIdAndUpdate(
//       pickupId,
//       { plantId: plantId, PickupStatus: "assigned" },
//       { new: true }
//     );

//     if (!updatedPickup) {
//       return res.status(404).json({ message: "Pickup not found" });
//     }

//     res
//       .status(200)
//       .json({ message: "Plant assigned successfully", updatedPickup });
//   } catch (error) {
//     console.error("Error updating plant:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
export const assignPlant = async (req, res) => {
  const { pickupId } = req.params;
  const { plantName } = req.body; // Change from plantId to plantName

  try {
    // Update the Pickup document with the selected plant name
    const updatedPickup = await Pickup.findByIdAndUpdate(
      pickupId,
      { plantName: plantName, PickupStatus: "assigned" }, // Update with plantName instead of ID
      { new: true }
    );

    if (!updatedPickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    res
      .status(200)
      .json({ message: "Plant assigned successfully", updatedPickup });
  } catch (error) {
    console.error("Error updating plant:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRiders = async (req, res) => {
  try {
    // Fetch all users with role 'rider'
    const riders = await User.find({ role: "rider" });
    res.status(200).json(riders);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Assign rider to an order
export const assignRider = async (req, res) => {
  try {
    const { orderId, riderName } = req.body;

    // Find the order by ID and update the rider name
    const order = await Order.findByIdAndUpdate(
      orderId,
      { riderName },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Assign rider to an order
export const assignPickupRider = async (req, res) => {
  try {
    const { orderId, riderName } = req.body;

    // Find the order by ID and update the rider name
    const pickup = await Pickup.findByIdAndUpdate(
      orderId, // Use orderId instead of pickupId as per frontend
      { riderName },
      { new: true }
    );

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        pickup, // Respond with the updated pickup
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
