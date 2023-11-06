import User from "../models/userModel.js";
import catchAsync from "../utills/catchAsync.js";

export const getProfile = catchAsync(async (req, res, next) => {
      const userId = (req?.user?._id).toString();
      
      console.log("here is the --->> ", userId)
      const user = await User.findById(userId);

      console.log("here is the --->> ", user)
      res.status(200).json(
        {
            profile: user,
            status: 'success'
        }
      )
});