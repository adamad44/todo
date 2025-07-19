require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const path = require("path");

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route handlers
app.use("/", require("./src/routes/views"));
app.use("/api", require("./src/routes/auth"));
app.use("/api", require("./src/routes/todos"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`Local: http://localhost:${PORT}`);
	console.log(`Network: http://192.168.1.170:${PORT}`);
});
