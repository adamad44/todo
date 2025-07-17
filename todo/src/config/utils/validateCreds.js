function validateCreds(username, password) {
	const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[.])[A-Za-z\d.]{6,}$/;
	const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
	return passwordRegex.test(password) && usernameRegex.test(username);
}

module.exports = validateCreds;
