const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticateToken } = require("./auth");

// GET /api/get-todos
router.get("/get-todos", authenticateToken, async (req, res) => {
	try {
		const userId = req.user.userID;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });
		console.log(user.todos);
		res.status(200).json(user.todos);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to fetch todos" });
	}
});

// POST /api/add-todo
router.post("/add-todo", authenticateToken, async (req, res) => {
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

// DELETE /api/delete-todo/:id
router.delete("/delete-todo/:id", authenticateToken, async (req, res) => {
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

// PATCH /api/update-todo/:id
router.patch("/update-todo/:id", authenticateToken, async (req, res) => {
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

router.post(
	"/change-state/:currentID/:checked",
	authenticateToken,
	async (req, res) => {
		try {
			const currentID = req.params.currentID;
			const currentState = req.params.checked;

			const user = await User.findById(req.user.userID);
			if (!user) return res.status(404).json({ error: "User not found" });

			const todo = user.todos.id(currentID);
			if (!todo) return res.status(404).json({ error: "Todo not found" });

			todo.completed = currentState === "true";

			await user.save();

			res.status(200).json({ success: true });
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: "Failed to change todo state" });
		}
	}
);

module.exports = router;
