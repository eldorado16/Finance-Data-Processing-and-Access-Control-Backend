const express = require("express");
const {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  transactionCreateSchema,
  transactionUpdateSchema,
  recordQuerySchema,
} = require("../utils/validators");

const router = express.Router();

router.use(authMiddleware);

router.get("/", validate(recordQuerySchema, "query"), getRecords);
router.get("/:id", getRecordById);
router.post("/", roleMiddleware(["admin"]), validate(transactionCreateSchema), createRecord);
router.put("/:id", roleMiddleware(["admin"]), validate(transactionUpdateSchema), updateRecord);
router.delete("/:id", roleMiddleware(["admin"]), deleteRecord);

module.exports = router;