const express = require("express");
const router = express.Router();

const { registeruser, loginUser } = require("../controllers/authController");

router.post("/register", registeruser);
router.post("/login", loginUser);       

module.exports = router;
