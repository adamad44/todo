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
			const token = jwt.sign({ userID: existingUser._id }, process.env.JWT_SECRET);

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

function authenticateToken(req, res, next) {
	const token = req.headers["authorization"];
	if (!token) return res.status(401).json({ error: "No token provided" });
	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ error: "Invalid token" });
		req.user = user;
		next();
	});
}

app.get("/api/get-todos", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.userID;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json(user.todos);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch todos" });
	}
});

app.post("/api/add-todo", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.userID;
		const user = await User.findById(userId);
		const { title } = req.body;
		if (!user) return res.status(404).json({ error: "user not found" });

		if (!title || title.trim() === "") {
			return res.status(400).json({ error: "Todo title is required" });
		}

		user.todos.push({ title });
		await user.save();

		res.status(201).json({ success: true });
	} catch (err) {
		res.status(500).json({ error: "Failed to add todo" });
	}
});

app.delete("/api/delete-todo/:id", authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user.userID);
		if (!user) return res.status(404).json({ error: "User not found" });

		const todoId = req.params.id;
		user.todos = user.todos.filter((todo) => todo._id.toString() !== todoId);
		await user.save();

		res.status(200).json({ success: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to delete todo" });
	}
});

app.patch("/api/update-todo/:id", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.userID;
		const todoId = req.params.id;
		const { title } = req.body;

		if (!title || title.trim() === "") {
			return res.status(400).json({ error: "Todo title is required" });
		}

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const todo = user.todos.id(todoId);
		if (!todo) return res.status(404).json({ error: "Todo not found" });

		todo.title = title.trim();
		await user.save();

		res.status(200).json({ success: true });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Failed to update todo" });
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
