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
