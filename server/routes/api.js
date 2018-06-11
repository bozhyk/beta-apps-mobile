const fs = require('fs');
const async = require('async');

const express = require('express');
const router = express.Router();

function getFileSize(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats["size"];
    return (fileSizeInBytes  / 1048576).toFixed(1);
}

function readDir(namePath, fileExt, domain, resultCallback) {
	fs.readdir(namePath, (err, files) => {
		var extFiles = files.filter((file) => file.endsWith(fileExt));
		async.map(extFiles, (fileName, callback) => {

			var filePath = namePath + fileName;
			var size = getFileSize(filePath);
			
			// Get content from metadata.json
 			var contents = JSON.parse(fs.readFileSync(namePath + 'metadata.json'));

			fs.stat(filePath, (err, stats) => {

				if (err) {
					return callback(err);
				}

				var date = stats["ctime"].toISOString();
				date = date.slice(0, 10);
				
				var link = "";
				var expiration = ""
				if (fileExt === '.ipa') {
					link = 'http://' + domain + '/data/ios/' + fileName;
					expiration = contents[fileName].expiration;
				} else if (fileExt == '.apk') {
					link = '/data/android/' +  fileName;
				}

				var icon = namePath + contents[fileName].icon;

				callback(null, {
					fileName: fileName,
					dateModified: date,
					dateExpired: expiration,
					fileSize: size,
					fileLink: link,
					iconLink: icon
				});
			});

		}, (err, results) => {
			if (typeof(resultCallback) == "function") {
				resultCallback(results);
			}
		});
	});
}

router.get('/ios-apps', (req, res) => {
	var iosPath = './data/ios/';
	var iosExt = '.ipa';
	var domain = req.headers.host;
	readDir(iosPath, iosExt, domain, (results) => {
		res.send(results);
	});
});

router.get('/android-apps', (req, res) => {
	var androidPath = './data/android/';
	var androidExt = '.apk';
	readDir(androidPath, androidExt, null, (results) => {
		res.send(results);
	});
});

module.exports = router;
