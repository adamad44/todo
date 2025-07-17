const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		minlength: 3,
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
	},
	todos: [
		{
			title: {
				type: String,
				required: true,
				trim: true,
			},
			completed: {
				type: Boolean,
				default: false,
			},
		},
	],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
