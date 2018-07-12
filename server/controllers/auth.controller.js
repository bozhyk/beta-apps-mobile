const User = require('../models/user');

function register(req, res) {
	let userData = req.body;
	let user = new User(userData);
	user.save((error, registeredUser) => {
		if (error) {
			console.error(error);
			res.status(400).send(error.message);
		} else {
			res.status(200).send(registeredUser)
		}
	})
}

function login(req, res) {
	let userData = req.body;
	User.findOne({email: userData.email}, (err, user) => {
		if (err) {
			console.error(err);
		} else {
			if (!user) {
				res.status(401).send('Invalid email')
			} else if ( user.password != userData.password) {
				res.status(401).send('Invalid password')
			} else {
				res.status(200).send(user)
			}
		}
	})
}

module.exports = { login, register };
