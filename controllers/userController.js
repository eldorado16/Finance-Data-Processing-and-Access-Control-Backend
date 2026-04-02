const mongoose = require("mongoose");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  return res.json({
    count: users.length,
    users,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const existingUser = await User.findById(id).select("-password");

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const isSelf = req.user._id.toString() === id;
  const nextRole = req.body.role || existingUser.role;
  const nextStatus = req.body.status || existingUser.status;

  if (isSelf && nextStatus === "inactive") {
    throw new ApiError(400, "You cannot deactivate your own account");
  }

  if (isSelf && nextRole !== "admin") {
    throw new ApiError(400, "You cannot remove your own admin role");
  }

  const willRemoveActiveAdmin =
    existingUser.role === "admin" &&
    existingUser.status === "active" &&
    (nextRole !== "admin" || nextStatus !== "active");

  if (willRemoveActiveAdmin) {
    const activeAdminsCount = await User.countDocuments({
      role: "admin",
      status: "active",
    });

    if (activeAdminsCount <= 1) {
      throw new ApiError(400, "At least one active admin account must remain");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      role: nextRole,
      status: nextStatus,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");

  return res.json({
    message: "User updated successfully",
    user: updatedUser,
  });
});

module.exports = {
  getUsers,
  updateUser,
};