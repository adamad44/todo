require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
	res.render("index", { title: "Home" });
});

app.get("/signup", (req, res) => {
	res.render("sign-up", { title: "Sign Up" });
});

function validateCreds(username, password) {
	// password must be at least 6 characters long and one capital letter and one number and one special character (. is included in the regex)
	const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[.])[A-Za-z\d.]{6,}$/;
	const passwordTest = passwordRegex.test(password);

	//username must be at least 3 characters long and only contain alphanumeric characters
	const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
	const usernameTest = usernameRegex.test(username);

	return passwordTest && usernameTest;
}

function hashPassword(password) {
	return bcrypt.hash(password, 10);
}

app.post("/api/register", async (req, res) => {
	const { username, password } = req.body;

	if (!validateCreds(username, password)) {
		return res.status(400).json({ error: "credentials dont meet requirements" });
	}

	try {
		// Check if user already exists
		const existingUser = await User.findOne({ username: username });
		if (existingUser) {
			return res.status(400).json({ error: "Username already exists" });
		}

		hashedPassword = await hashPassword(password);
		// Create new user
		const newUser = new User({
			username: username,
			password: hashedPassword,
		});

		// Save user to database
		await newUser.save();
		console.log(`User registered successfully: ${username}`);

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			username: username,
			userId: newUser._id,
		});
	} catch (error) {
		console.error("Registration error:", error);

		// Handle specific MongoDB errors
		if (error.code === 11000) {
			return res.status(400).json({ error: "Username already exists" });
		}

		res.status(500).json({ error: "Internal server error" });
	}
});

app.post("/api/login", async (req, res) => {
	const { username, password } = req.body;

	if (!validateCreds(username, password)) {
		return res.status(400).json({ error: "credentials dont meet requirements" });
	}

	try {
		const existingUser = await User.findOne({ username: username });
		if (!existingUser) {
			return res.status(400).json({ error: "User not found" });
		}

		const validPassword = await bcrypt.compare(password, existingUser.password);

		if (!validPassword) {
			return res.status(400).json({ error: "password incorrect" });
		}
		if (validPassword) {
			const token = jwt.sign({ userID: User._id }, process.env.JWT_SECRET);

			return res.status(201).json({
				success: true,
				message: "User logged in successfully",
				username: username,
				userId: existingUser._id,
				token: token,
			});
		}
	} catch (error) {
		console.error("Registration error:", error);

		// Handle specific MongoDB errors
		if (error.code === 11000) {
			return res.status(400).json({ error: "Username already exists" });
		}

		res.status(500).json({ error: "Internal server error" });
	}
});

app.get("/dashboard", (req, res) => {
	res.render("dashboard", { title: "Dashboard" });
});

app.get("/login", (req, res) => {
	res.render("login", { title: "Login" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
