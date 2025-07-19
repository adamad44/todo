const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validateCreds = require("../config/utils/validateCreds");
const hashPassword = require("../config/utils/hashPassword");

// POST /api/register
router.post("/register", async (req, res) => {
	const { username, password } = req.body;

	if (!validateCreds(username, password)) {
		return res.status(400).json({ error: "credentials don't meet requirements" });
	}

	try {
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username already exists" });
		}

		const hashedPassword = await hashPassword(password);
		const newUser = new User({ username, password: hashedPassword });
		await newUser.save();

		console.log(`User registered successfully: ${username}`);
		res.status(201).json({
			success: true,
			message: "User registered successfully",
			username,
			userId: newUser._id,
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /api/login
router.post("/login", async (req, res) => {
	const { username, password } = req.body;

	if (!validateCreds(username, password)) {
		return res.status(400).json({ error: "credentials don't meet requirements" });
	}

	try {
		const existingUser = await User.findOne({ username });
		if (!existingUser) {
			return res.status(400).json({ error: "User not found" });
		}

		const validPassword = await bcrypt.compare(password, existingUser.password);
		if (!validPassword) {
			return res.status(400).json({ error: "Password incorrect" });
		}

		const token = jwt.sign({ userID: existingUser._id }, process.env.JWT_SECRET);
		res.status(200).json({
			success: true,
			message: "Login successful",
			username,
			userId: existingUser._id,
			token,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

function authenticateToken(req, res, next) {
	const token = req.headers["authorization"];
	if (!token) return res.status(401).json({ error: "No token provided" });

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ error: "Invalid token" });
		req.user = user;
		next();
	});
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
