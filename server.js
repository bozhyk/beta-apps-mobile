// server.js
const app = require('./server/express');

// Start the app by listening on the default
app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'));
});
