const signUpFormElement = document.querySelector("#signup-form");
const dashboardElement = document.querySelector("#dashboard-root");
const token = localStorage.getItem("token");
const currentPath = window.location.pathname;

const publicPaths = ["/", "/login", "/sign-up"];
const privatePaths = ["/dashboard"];

if (publicPaths.includes(currentPath) && token) {
	window.location.href = "/dashboard";
}

if (privatePaths.includes(currentPath) && !token) {
	window.location.href = "/login";
}

if (currentPath === "/dashboard") {
	loadTodos();
}

const logoutBtn = document.querySelector("#logout-button");

if (logoutBtn) {
	logoutBtn.addEventListener("click", () => {
		localStorage.removeItem("token");
		window.location.href = "/";
	});
}

if (signUpFormElement) {
	signUpFormElement.addEventListener("submit", async function (event) {
		event.preventDefault(); // Stop the form from submitting normally

		const username = document.querySelector("#username").value;
		const password = document.querySelector("#password").value;

		console.log("Username:", username);
		console.log("Password:", password);

		// Send to your backend API
		try {
			const res = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			console.log(data);

			if (res.ok) {
				document.querySelector("#error-message").style.display = "none";

				window.location.href = "/login";
			} else {
				document.querySelector("#error-message").style.display = "block";
				document.querySelector("#error-message").textContent =
					data.error || "Registration failed. Please try again.";
				console.error("Registration error:", data.error);
			}
		} catch (err) {
			console.error("Fetch error:", err);
			document.querySelector("#error-message").style.display = "block";
			document.querySelector("#error-message").textContent =
				"An error occurred while registering. Please try again.";
		}
	});
}
const loginFormElement = document.querySelector("#login-form");
if (loginFormElement) {
	loginFormElement.addEventListener("submit", async function (event) {
		event.preventDefault(); // Stop the form from submitting normally

		const username = document.querySelector("#username").value;
		const password = document.querySelector("#password").value;

		console.log("Username:", username);
		console.log("Password:", password);

		// Send to your backend API
		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			console.log(data);

			if (res.ok) {
				document.querySelector("#error-message").style.display = "none";
				localStorage.setItem("token", data.token);
				window.location.href = "/dashboard";
			} else {
				document.querySelector("#error-message").style.display = "block";
				document.querySelector("#error-message").textContent =
					data.error || "Login failed. Please try again.";
				console.error("Login error:", data.error);
			}
		} catch (err) {
			console.error("Fetch error:", err);
			document.querySelector("#error-message").style.display = "block";
			document.querySelector("#error-message").textContent =
				"An error occurred while logging in. Please try again.";
		}
	});
}

async function loadTodos() {
	try {
		const res = await fetch("/api/get-todos", {
			headers: {
				Authorization: token,
			},
		});

		if (!res.ok) {
			console.log(res);
			throw new Error("Failed to fetch todos");
		}

		const todos = await res.json();
		todoListElement.innerHTML = "";
		todos.forEach((todo) => {
			const todoItem = document.createElement("li");
			todoItem.style.display = "flex";
			todoItem.style.alignItems = "center";
			todoItem.style.gap = "10px";
			todoItem.style.marginBottom = "10px";

			// Todo title
			const titleSpan = document.createElement("span");
			titleSpan.textContent = todo.title;
			titleSpan.style.flexGrow = "1";

			// Remove button
			const removeButton = document.createElement("button");
			removeButton.textContent = "Remove";
			removeButton.style.padding = "5px 10px";
			removeButton.style.fontSize = "0.9rem";
			removeButton.dataset.id = todo._id;
			removeButton.addEventListener("click", async function () {
				const currentID = this.dataset.id;
				await fetch(`/api/delete-todo/${currentID}`, {
					method: "DELETE",
					headers: {
						Authorization: token,
					},
				});
				loadTodos();
			});

			// Edit button
			const editButton = document.createElement("button");
			editButton.textContent = "Edit";
			editButton.style.padding = "5px 10px";
			editButton.style.fontSize = "0.9rem";
			editButton.dataset.id = todo._id;
			editButton.addEventListener("click", async function () {
				const currentID = this.dataset.id;
				const newTitle = prompt("Enter new title:", todo.title);

				if (newTitle && newTitle.trim()) {
					await fetch(`/api/update-todo/${currentID}`, {
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: token,
						},
						body: JSON.stringify({
							title: newTitle.trim(),
						}),
					});
					loadTodos();
				}
			});

			todoItem.appendChild(titleSpan);
			todoItem.appendChild(removeButton);
			todoItem.appendChild(editButton);
			todoListElement.appendChild(todoItem);
		});
		return todos;
	} catch (error) {
		console.error("Error loading todos:", error);
	}
}

const addTodoButton = document.querySelector("#add-todo-button");
const todoInputField = document.querySelector("#todo-input");
const todoListElement = document.querySelector("#todo-list");

if (addTodoButton) {
	addTodoButton.addEventListener("click", async function (event) {
		const errorMessage = document.querySelector("#error-message");
		todoInputValue = todoInputField.value.trim();
		if (!todoInputValue) {
			errorMessage.style.display = "block";
			errorMessage.textContent = "Enter a todo!";
			return;
		} else errorMessage.style.display = "none";

		try {
			const res = await fetch("/api/add-todo", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
				body: JSON.stringify({ title: todoInputValue }),
			});

			if (res.ok) {
				console.log(`Todo added`);
				todoInputField.value = "";
				loadTodos();
			} else {
				console.log(res.error);
			}
		} catch (error) {
			console.error("Error adding todo:", error);
			const errorMessage = document.querySelector("#error-message");
			errorMessage.style.display = "block";
			errorMessage.textContent = "Failed to add todo. Please try again.";
		}
	});

	todoInputField.addEventListener("keypress", async function (event) {
		if (event.key === "Enter") {
			event.preventDefault();
			addTodoButton.click();
		}
	});
}
