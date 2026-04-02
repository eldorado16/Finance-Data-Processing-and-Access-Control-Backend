require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const getSaltRounds = () => {
  const configured = Number(process.env.BCRYPT_SALT_ROUNDS);

  if (!Number.isFinite(configured)) {
    return 10;
  }

  return Math.min(Math.max(Math.trunc(configured), 8), 14);
};

const seed = async () => {
  await connectDB();

  const name = (process.env.SEED_ADMIN_NAME || "System Admin").trim();
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password) {
    throw new Error("SEED_ADMIN_PASSWORD is required in .env");
  }

  if (password.length < 8 || !PASSWORD_POLICY_REGEX.test(password)) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must be at least 8 chars and include uppercase, lowercase, number, and special character"
    );
  }

  const passwordHash = await bcrypt.hash(password, getSaltRounds());
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    existingAdmin.name = name;
    existingAdmin.password = passwordHash;
    existingAdmin.role = "admin";
    existingAdmin.status = "active";
    await existingAdmin.save();
    console.log(`Admin user updated: ${email}`);
  } else {
    await User.create({
      name,
      email,
      password: passwordHash,
      role: "admin",
      status: "active",
    });
    console.log(`Admin user created: ${email}`);
  }
};

seed()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });