const fs = require('fs');
const defaultEnv = "development";

if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = defaultEnv;
}

var fileName = process.env.NODE_ENV;

if (!fs.existsSync(__dirname + '/' + fileName + '.js')) {
	console.log(`file ${fileName} does not exist, use ${ defaultEnv }`);
	fileName = defaultEnv;
}

const config = require('./' + fileName);
module.exports = config;
