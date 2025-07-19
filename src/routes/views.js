const express = require("express");
const router = express.Router();

// GET /
router.get("/", (req, res) => {
	res.render("index", { title: "Home" });
});

// GET /login
router.get("/login", (req, res) => {
	res.render("login", { title: "Login" });
});

// GET /dashboard
router.get("/dashboard", (req, res) => {
	res.render("dashboard", { title: "Dashboard" });
});

module.exports = router;
