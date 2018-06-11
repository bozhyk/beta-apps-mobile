const express = require('express');
const path = require('path');
const appRoot = require('app-root-path');

const app = express();

const api = require('./routes/api');

// Set our api routes
app.use('/api', api);

app.set('port', (process.env.PORT || 3000));

// Run the app by serving the static files
// in the dist directory

app.use(express.static(path.join(appRoot.path, 'dist')));
app.use("/data/ios/", express.static(path.join(appRoot.path, '/data/ios')));
app.use("/data/android/", express.static(path.join(appRoot.path, '/data/android')));

module.exports = app;
