const express = require("express");
const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
} = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { analyticsQuerySchema } = require("../utils/validators");

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["admin", "analyst"]));

router.get("/summary", validate(analyticsQuerySchema, "query"), getSummary);
router.get("/categories", validate(analyticsQuerySchema, "query"), getCategoryBreakdown);
router.get("/trends", validate(analyticsQuerySchema, "query"), getMonthlyTrends);

module.exports = router;