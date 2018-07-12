// server.js
const app = require('./server/express'),
	  mongoose = require('mongoose'),
	  config = require('./server/config');

if (process.env.NODE_ENV == 'development') {
	mongoose.connect(config.db, { useNewUrlParser: true }, function (error) {
		if (error) {
			console.error(`Can not connect to the database: ${error}`);
		} else {
		console.log('connected to mongodb');
		}
	});
}

const port = app.get('port');

// Start the app by listening on the default
app.listen(port, function() {
	console.log(`Node app is running at localhost:${ port } (${ process.env.NODE_ENV })`);
});
