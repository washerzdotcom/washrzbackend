import User from "../models/userModel";
import catchAsync from "../utills/catchAsync";

export const getProfile = catchAsync(async (req, res, next) => {
      const userId = req.userId;
      const user = User.findById(userId);
      res.status(200).json(
        {
            profile: user,
            status: 'success'
        }
      )
});