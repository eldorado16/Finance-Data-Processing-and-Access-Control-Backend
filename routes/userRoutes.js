const express = require("express");
const { getUsers, updateUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");
const { updateUserSchema } = require("../utils/validators");

const router = express.Router();

router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/", getUsers);
router.patch("/:id", validate(updateUserSchema), updateUser);

module.exports = router;