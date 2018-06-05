const fs = require('fs');
const async = require('async');

const express = require('express');
const router = express.Router();


function getFileSize(filename) {
    var stats = fs.statSync(filename);
    var fileSizeInBytes = stats["size"];
    return (fileSizeInBytes  / 1000000.0).toFixed(2);
}

function readDir(namePath, fileExt, domain, resultCallback) {
	fs.readdir(namePath, (err, files) => {
		var extFiles = files.filter((file) => file.endsWith(fileExt));
		async.map(extFiles, (fileName, callback) => {

			var filePath = namePath + fileName;
			var size = getFileSize(filePath);
			fs.stat(filePath, (err, stats) => {

				if (err) {
					return callback(err);
				}

				var date = stats["ctime"].toISOString();
				date = date.replace(/T/, ' ').      // replace T with a space
							replace(/\..+/, '');


				var link = "";
				if (fileExt === '.ipa') {
					link = 'itms-services://?action=download-manifest&amp;url=' +
					       'https://' + domain +
					       '/data/ios/' + fileName.slice(0, -3) + 'plist';
				} else if (fileExt == '.apk') {
					link = '/data/android/' +  fileName;
				}

				var icon = "";
				if (fileName.indexOf("Qooco") > 0) {
					icon = namePath + 'icons/QoocoTalk.png';
				} else if (fileName.indexOf("TalkingPets") > 0) {
					icon = namePath + 'icons/TalkingPets.png';
				}

				callback(null, {
					fileName: fileName,
					dateModified: date,
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
