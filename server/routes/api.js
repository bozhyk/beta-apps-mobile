const fs = require('fs');
const async = require('async');
const AdmZip = require('adm-zip');

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
				var expirationDate = 'N/A';

				if (fileExt === '.ipa') {
					link = 'http://' + domain + '/data/ios/' + fileName;

					// DETECT EXPIRATION DATE

					// reading archives
					var zip = new AdmZip(filePath);

					// an array of apiEntry records
					var apiEntries = zip.getEntries();
					apiEntries.forEach(function(zipEntry) {
						// find embedded.mobileprovision file with expiration date info
						var fileName = zipEntry.entryName.substring(zipEntry.entryName.lastIndexOf("/") + 1);
						if (fileName == 'embedded.mobileprovision') {
							var fileToString = zipEntry.getData().toString('utf8');
							// find ExpirationDate in file
							var expirationDateIndex = fileToString.indexOf('ExpirationDate');
							if (expirationDateIndex > -1) {
								expirationDate = fileToString.slice(expirationDateIndex + 28, expirationDateIndex + 38);
							}
						}
					});

				} else if (fileExt == '.apk') {
					link = '/data/android/' +  fileName;
				}

				var icon = namePath + contents[fileName].icon;

				callback(null, {
					fileName: fileName,
					dateModified: date,
					dateExpired: expirationDate,
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
	console.log(domain);
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
