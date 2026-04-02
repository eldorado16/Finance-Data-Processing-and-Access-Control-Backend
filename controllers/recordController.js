const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const buildRecordFilter = (query) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.type) {
    filter.type = query.type;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) {
      filter.date.$gte = query.startDate;
    }
    if (query.endDate) {
      filter.date.$lte = query.endDate;
    }
  }

  return filter;
};

const getRecords = asyncHandler(async (req, res) => {
  const filter = buildRecordFilter(req.query);

  const records = await Transaction.find(filter)
    .populate("createdBy", "name email role")
    .sort({ date: -1, createdAt: -1 });

  return res.json({
    count: records.length,
    records,
  });
});

const getRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid record id");
  }

  const record = await Transaction.findById(id).populate("createdBy", "name email role");

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  return res.json({
    record,
  });
});

const createRecord = asyncHandler(async (req, res) => {
  const record = await Transaction.create({
    ...req.body,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    message: "Record created successfully",
    record,
  });
});

const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid record id");
  }

  const record = await Transaction.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  return res.json({
    message: "Record updated successfully",
    record,
  });
});

const deleteRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid record id");
  }

  const record = await Transaction.findByIdAndDelete(id);

  if (!record) {
    throw new ApiError(404, "Record not found");
  }

  return res.json({
    message: "Record deleted successfully",
  });
});

module.exports = {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};