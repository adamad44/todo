const signUpFormElement = document.querySelector("#signup-form");
const dashboardElement = document.querySelector("#dashboard-root");
const token = localStorage.getItem("token");
const currentPath = window.location.pathname;
const publicPaths = ["/", "/login"];
const privatePaths = ["/dashboard"];
const errorMessageElement = document.querySelector("#error-message");
const usernameElement = document.querySelector("#username");
const passwordElement = document.querySelector("#password");
const loginFormElement = document.querySelector("#login-form");
const logoutBtn = document.querySelector("#logout-button");
const addTodoButton = document.querySelector("#add-todo-button");
const todoInputField = document.querySelector("#todo-input");
const todoListElement = document.querySelector("#todo-list");

if (publicPaths.includes(currentPath) && token) {
	window.location.href = "/dashboard";
}

if (privatePaths.includes(currentPath) && !token) {
	window.location.href = "/login";
}

if (currentPath === "/dashboard") {
	loadTodos();
}

if (logoutBtn) {
	logoutBtn.addEventListener("click", () => {
		localStorage.removeItem("token");
		window.location.href = "/";
	});
}

if (signUpFormElement) {
	signUpFormElement.addEventListener("submit", async function (event) {
		event.preventDefault();
		const username = usernameElement.value;
		const password = passwordElement.value;

		console.log("Username:", username);
		console.log("Password:", password);

		try {
			const res = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			console.log(data);

			if (res.ok) {
				errorMessageElement.style.display = "none";

				window.location.href = "/login";
			} else {
				errorMessageElement.style.display = "block";
				errorMessageElement.textContent =
					data.error || "Registration failed. Please try again.";
				console.error("Registration error:", data.error);
			}
		} catch (err) {
			console.error("Fetch error:", err);
			errorMessageElement.style.display = "block";
			errorMessageElement.textContent =
				"An error occurred while registering. Please try again.";
		}
	});
}

if (loginFormElement) {
	loginFormElement.addEventListener("submit", async function (event) {
		event.preventDefault();

		const username = usernameElement.value;
		const password = passwordElement.value;

		console.log("Username:", username);
		console.log("Password:", password);

		try {
			const res = await fetch("/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			console.log(data);

			if (res.ok) {
				errorMessageElement.style.display = "none";
				localStorage.setItem("token", data.token);
				window.location.href = "/dashboard";
			} else {
				errorMessageElement.style.display = "block";
				errorMessageElement.textContent =
					data.error || "Login failed. Please try again.";
				console.error("Login error:", data.error);
			}
		} catch (err) {
			console.error("Fetch error:", err);
			errorMessageElement.style.display = "block";
			errorMessageElement.textContent =
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
		todos
			.sort((a, b) => a.order - b.order)
			.forEach((todo) => {
				const todoItem = document.createElement("li");
				todoItem.style.display = "flex";
				todoItem.style.alignItems = "center";
				todoItem.style.gap = "10px";
				todoItem.style.marginBottom = "10px";

				const titleSpan = document.createElement("span");
				titleSpan.textContent = todo.title;
				titleSpan.style.flexGrow = "1";
				titleSpan.style.textDecoration = todo.completed ? "line-through " : "none";
				titleSpan.style.textDecorationThickness = todo.completed ? "2px" : "none";
				titleSpan.style.color = todo.completed ? "grey" : "";

				const upButton = document.createElement("button");
				upButton.textContent = "Ʌ";
				upButton.style.padding = "5px 5px";
				upButton.style.fontSize = "1rem";
				upButton.style.lineHeight = "1";
				upButton.dataset.id = todo._id;
				upButton.addEventListener("click", async function () {
					const currentID = this.dataset.id;

					const res = await fetch(`/api/move/${currentID}/1`, {
						method: "POST",
						headers: {
							Authorization: token,
						},
					});

					if (res.ok) {
						loadTodos();
					}
				});

				const downButton = document.createElement("button");
				downButton.textContent = "V";
				downButton.style.padding = "5px 5px";
				downButton.style.fontSize = "1rem";
				downButton.style.lineHeight = "1";
				downButton.dataset.id = todo._id;

				const checkButton = document.createElement("input");
				checkButton.style.cursor = "pointer";
				checkButton.type = "checkbox";
				checkButton.dataset.id = todo._id;
				checkButton.checked = todo.completed;
				checkButton.addEventListener("change", async function () {
					const currentID = this.dataset.id;
					titleSpan.style.textDecoration = this.checked ? "line-through " : "none";
					titleSpan.style.textDecorationThickness = this.checked ? "2px" : "none";
					titleSpan.style.color = this.checked ? "grey" : "";

					const res = await fetch(`/api/change-state/${currentID}/${this.checked}`, {
						method: "POST",
						headers: {
							Authorization: token,
						},
					});
				});

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
				todoItem.appendChild(checkButton);
				todoItem.appendChild(titleSpan);
				todoItem.appendChild(removeButton);
				todoItem.appendChild(editButton);
				todoItem.appendChild(upButton);
				todoItem.appendChild(downButton);

				todoListElement.appendChild(todoItem);
			});
		return todos;
	} catch (error) {
		console.error("Error loading todos:", error);
	}
}

if (addTodoButton) {
	addTodoButton.addEventListener("click", async function (event) {
		todoInputValue = todoInputField.value.trim();
		if (!todoInputValue) {
			errorMessageElement.style.display = "block";
			errorMessageElement.textContent = "Enter a todo!";
			return;
		} else errorMessageElement.style.display = "none";

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
			errorMessageElement.style.display = "block";
			errorMessageElement.textContent = "Failed to add todo. Please try again.";
		}
	});

	todoInputField.addEventListener("keypress", async function (event) {
		if (event.key === "Enter") {
			event.preventDefault();
			addTodoButton.click();
		}
	});
}
