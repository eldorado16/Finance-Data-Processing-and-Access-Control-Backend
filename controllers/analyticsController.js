const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");

const buildDateMatch = (query) => {
  const match = {};

  if (query.startDate || query.endDate) {
    match.date = {};

    if (query.startDate) {
      match.date.$gte = query.startDate;
    }

    if (query.endDate) {
      match.date.$lte = query.endDate;
    }
  }

  return match;
};

const getSummary = asyncHandler(async (req, res) => {
  const match = buildDateMatch(req.query);

  const totals = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const totalIncome = totals.find((item) => item._id === "income")?.total || 0;
  const totalExpense = totals.find((item) => item._id === "expense")?.total || 0;

  return res.json({
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  });
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const match = {
    ...buildDateMatch(req.query),
    type: "expense",
  };

  const categories = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        total: 1,
        count: 1,
      },
    },
  ]);

  return res.json({
    categories,
  });
});

const getMonthlyTrends = asyncHandler(async (req, res) => {
  const match = buildDateMatch(req.query);

  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const map = new Map();

  for (const row of rows) {
    const month = String(row._id.month).padStart(2, "0");
    const key = `${row._id.year}-${month}`;

    if (!map.has(key)) {
      map.set(key, {
        month: key,
        income: 0,
        expense: 0,
      });
    }

    const monthData = map.get(key);
    monthData[row._id.type] = row.total;
  }

  return res.json({
    trends: Array.from(map.values()),
  });
});

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
};