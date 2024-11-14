import AWS from "aws-sdk";
import multer from "multer";
import cron from "node-cron";
import Pickup from "../models/pickupSchema.js";
import Order from "../models/orderSchema.js";
import catchAsync from "../utills/catchAsync.js";
import User from "../models/userModel.js";

// upload audio and voice
// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 },
}).fields([
  { name: "image", maxCount: 1 }, // `image` should match frontend field name
  { name: "voice", maxCount: 1 }, // `voice` should match frontend field name
]);

// Function to upload files to S3
const uploadToS3 = (file, bucketName) => {
  const params = {
    Bucket: bucketName,
    Key: `intransiteOrderImage/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  return s3.upload(params).promise();
};

// Upload files and update order status
export const uploadFiles = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Error uploading files.", err });
    }

    const { id } = req.params;
    const { image, voice } = req.files;
    const { currObj, price } = req.body;
    console.log(image, voice, currObj, price);

    if (!id || !image || !voice || !price) {
      return res.status(400).json({
        message:
          "Order ID, image, voice files, currObj, and price are required.",
      });
    }
    if (!currObj) {
      return res.status(400).json({
        message: "currObj are required.",
      });
    }

    try {
      // Parse the stringified currObj
      const parsedCurrObj = JSON.parse(currObj);

      // Ensure parsedCurrObj is an object and contains the necessary fields
      if (!parsedCurrObj || typeof parsedCurrObj !== "object") {
        return res.status(400).json({ message: "Invalid currObj format." });
      }

      // Upload files to S3
      const imageUpload = await uploadToS3(
        image[0],
        process.env.AWS_S3_BUCKET_NAME
      );
      const voiceUpload = await uploadToS3(
        voice[0],
        process.env.AWS_S3_BUCKET_NAME
      );

      // Get the latest order and calculate order ID
      const latestOrder = await Order.find().sort({ _id: -1 });
      let order_id = `WZ1001`;
      if (latestOrder.length > 0) {
        order_id = latestOrder[0].order_id.split("WZ")[1] * 1 + 1;
        order_id = "WZ" + order_id;
      }

      // Create a new order in the database
      await Order.create({
        contactNo: parsedCurrObj.contactNo,
        customerName: parsedCurrObj.customerName,
        address: parsedCurrObj.address,
        items: parsedCurrObj.items,
        price: price, // From req.body
        order_id,
        intransitVoice: voiceUpload.Location,
        intransitImage: imageUpload.Location,
        plantName: parsedCurrObj.plantName,
      });

      res.status(200).json({
        message: "Files uploaded and order status updated to processing.",
        latestOrder,
      });
    } catch (error) {
      console.error("Error uploading files or updating order:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
};

// Reschedule Pickup Controller
export const reschedulePickup = async (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;

  try {
    const pickup = await Pickup.findById(id);
    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    // Update the rescheduled date and mark as rescheduled
    pickup.rescheduledDate = newDate;
    pickup.isRescheduled = true;
    await pickup.save();

    res.status(200).json({ message: "Pickup rescheduled successfully" });
  } catch (error) {
    console.error("Error in rescheduling:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to move rescheduled pickups back to live
const moveRescheduledPickups = async () => {
  try {
    const today = new Date();
    const pickupsToMove = await Pickup.find({
      rescheduledDate: { $lte: today },
      isRescheduled: true,
    });

    for (const pickup of pickupsToMove) {
      pickup.isRescheduled = false; // Mark as live
      pickup.rescheduledDate = null; // Clear the rescheduled date
      await pickup.save();
    }

    console.log("Rescheduled pickups moved back to live");
  } catch (error) {
    console.error("Error moving rescheduled pickups:", error);
  }
};

// Function to move rescheduled Orders back to ready for deliveries
const moveRescheduledOrders = async () => {
  try {
    const today = new Date();
    const ordersToMove = await Order.find({
      rescheduledDate: { $lte: today },
      isRescheduled: true,
    });

    for (const order of ordersToMove) {
      order.isRescheduled = false; // Mark as live
      order.rescheduledDate = null; // Clear the rescheduled date
      await order.save();
    }

    console.log("Rescheduled orders moved back to live");
  } catch (error) {
    console.error("Error moving rescheduled orders:", error);
  }
};

// Schedule a cron job to run every day at midnight
cron.schedule("0 * * * *", () => {
  console.log("Running daily rescheduled orders check...");
  moveRescheduledPickups();
  moveRescheduledOrders();
});

// Get all rescheduled pickups
export const getRescheduledPickups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 8;
    const email = req.query.email;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user to get the plant name associated with the email
    const user = await User.findOne({ email });
    if (!user || !user.plant) {
      return res.status(404).json({ message: "User or Plant not found" });
    }

    // Use the user's plant name to filter rescheduled pickups
    const plantName = user.plant;

    // Query to find rescheduled pickups for the specific plant
    const rescheduledPickups = await Pickup.find({
      isRescheduled: true,
      plantName: plantName, // Filter by the user's plant name
    })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const total = await Pickup.countDocuments({
      isRescheduled: true,
      plantName: plantName, // Filter count by the user's plant name
    });

    res.status(200).json({
      data: rescheduledPickups,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching rescheduled pickups", error });
  }
};

// cencelled pickup
export const deletePickup = catchAsync(async (req, res, next) => {
  const pickupData = await Pickup.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
  });
  if (!pickupData) {
    return next(new AppError("No pickup found with that ID", 404));
  }
  res.status(200).json({
    message: "Pickup Deleted Sucessfully",
  });
});

// Configure multer for file upload (note and optional voice)
const uploadNote = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 },
}).fields([
  { name: "note", maxCount: 1 }, // `note` text field
  { name: "voice", maxCount: 1 }, // `voice` is optional and can be provided from the frontend
]);

// Function to upload files to S3
const uploadNoteToS3 = (file, bucketName, folder) => {
  const params = {
    Bucket: bucketName,
    Key: `${folder}/${Date.now()}_${file.originalname}`, // Store files in the specified folder
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  return s3.upload(params).promise();
};

export const uploadCancelInfo = catchAsync(async (req, res) => {
  uploadNote(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Error uploading files.", err });
    }

    const { id } = req.params; // Get pickup ID from request params
    const { voice } = req.files; // Only the voice is expected as a file now
    const { note } = req.body; // Get the note as a text field from the body

    if (!note) {
      return res.status(400).json({
        message: "Short note is required.",
      });
    }
    if (!id) {
      return res.status(400).json({
        message: "Pickup ID is required.",
      });
    }

    try {
      let voiceUpload = null;
      // If voice is provided, upload it to S3
      if (voice && voice.length > 0) {
        voiceUpload = await uploadNoteToS3(
          voice[0],
          process.env.AWS_S3_BUCKET_NAME,
          "pickupCancelVoices"
        );
      }

      // Update the pickup in the database with the note and voice URLs
      await Pickup.findByIdAndUpdate(id, {
        cancelNote: note, // Save the note text directly
        cancelVoice: voiceUpload ? voiceUpload.Location : null, // URL of the uploaded voice (if available)
      });
      const pickupData = await Pickup.findByIdAndUpdate(id, {
        isDeleted: true,
      });
      if (!pickupData) {
        return next(new AppError("No pickup found with that ID", 404));
      }

      res.status(200).json({
        message: "Files uploaded successfully and pickup status updated.",
      });
    } catch (error) {
      console.error("Error uploading files or updating pickup:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
});

// Configure multer for file upload (image) when rider compelet order
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 },
}).fields([{ name: "image", maxCount: 1 }]);

export const uploadDeliverImage = catchAsync(async (req, res) => {
  uploadImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Error uploading files.", err });
    }

    const { id } = req.params; // Get pickup ID from request params
    const { image } = req.files;
    console.log(id, image);

    if (!image) {
      return res.status(400).json({
        message: "Image is required.",
      });
    }
    if (!id) {
      return res.status(400).json({
        message: "Order ID is required.",
      });
    }
    try {
      // Upload files to S3
      const imageUpload = await uploadNoteToS3(
        image[0],
        process.env.AWS_S3_BUCKET_NAME,
        "CompleteOrderImage"
      );

      // Update the pickup in the database with the note and voice URLs
      await Order.findByIdAndUpdate(id, {
        deliverImage: imageUpload.Location, // URL of the uploaded voice (if available)
      });
      res.status(200).json({
        message: "Files uploaded successfully and pickup status updated.",
      });
    } catch (error) {
      console.error("Error uploading files or updating pickup:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
});

// Reschedule deliveries order Controller
export const rescheduleOrder = async (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the rescheduled date and mark as rescheduled
    order.rescheduledDate = newDate;
    order.isRescheduled = true;
    await order.save();

    res.status(200).json({ message: "Order rescheduled successfully" });
  } catch (error) {
    console.error("Error in rescheduling order : ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all rescheduled deliveries order
export const getRescheduledOrders = async (req, res) => {
  try {
    const { email } = req.query;

    // Fetch the plant name associated with this email
    const user = await User.findOne({ email: email });
    if (!user || !user.plant) {
      return res.status(404).json({ message: "User or Plant not found" });
    }

    // Use the user's plant name to filter pickups
    const plantName = user.plant;

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 8;

    // Query to find rescheduled pickups
    const rescheduledOrders = await Order.find({
      isRescheduled: true,
      plantName: plantName,
    })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const total = await Order.countDocuments({
      isRescheduled: true,
      plantName: plantName,
    });

    res.status(200).json({
      data: rescheduledOrders,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching rescheduled Orders", error });
  }
};

// get note and voice

export const getCancelMedia = async (req, res) => {
  const { pickupId } = req.params;

  try {
    // Find the order by ID
    const pickup = await Pickup.findById(pickupId);

    if (!pickup) {
      return res.status(404).json({ message: "pickup not found" });
    }

    const cancelNote = pickup.cancelNote;
    const voiceUrl = pickup.cancelVoice;

    res.status(200).json({ voiceUrl, cancelNote });
  } catch (error) {
    console.error("Error fetching pickup media:", error);
    res.status(500).json({ message: "Failed to fetch pickup media" });
  }
};

// Function to list and delete files from S3 for multiple directories
const deleteOrderRelatedFiles = async () => {
  const directories = [
    "intransiteOrderImage/",
    "pickupCancelVoices/",
    "beforeOrderImage/",
    "CompleteOrderImage/",
  ];

  try {
    for (const dir of directories) {
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Prefix: dir,
      };

      const listedObjects = await s3.listObjectsV2(params).promise();

      if (listedObjects.Contents.length === 0) continue; // Skip if no files found in the directory

      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Delete: { Objects: [] },
      };

      listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
      });

      await s3.deleteObjects(deleteParams).promise();

      // Handle truncated lists (if too many objects exist in the directory)
      if (listedObjects.IsTruncated) {
        await deleteOrderRelatedFiles(); // Recursively delete remaining objects
      }

      console.log(`Files from ${dir} deleted successfully`);
    }
  } catch (err) {
    console.error("Error deleting files from S3:", err);
  }
};

// Schedule cron job to run every Sunday at midnight 0 0 * * 0
cron.schedule("0 0 * * 0", () => {
  console.log("Running a task every Sunday at midnight");
  deleteOrderRelatedFiles();
});
