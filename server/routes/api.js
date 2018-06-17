const fs = require('fs');
const async = require('async');
const express = require('express');
const router = express.Router();
const PkgReader = require('isomorphic-pkg-reader');
const uuid = require('uuid/v4');

function getInfoFromPkg(filePath, extension, callback) {

	console.log(`getting info for ipa: ${ filePath }`);

	var reader = new PkgReader(filePath, extension, { withIcon: true, iconType: 'buffer', searchResource: true });

	reader.parse(function(err, pkgInfo) {

		if (err) {
			console.log(err);
		}

		var iconPath = "./data/" +
					   (extension == "ipa" ? "ios" : "android") +
					   "/icons/" + uuid() + ".png";

		var expirationDate = null;
		if (extension == 'ipa' && pkgInfo.mobileProvision) {
			expirationDate = pkgInfo.mobileProvision.ExpirationDate;
			if (expirationDate) {
				expirationDate = expirationDate.toISOString().substring(0, 10);
			}
		}

		fs.writeFile(iconPath, pkgInfo.icon, function () {

			var result = {
				icon: iconPath
			};

			if (expirationDate) {
				result.expiration = expirationDate;
			}

			callback(null, result);
		});

	});
}

function collectAppInfo(filePath, webPath, domain, callback) {

	fs.stat(filePath, (err, stats) => {

		if (err) {
			return callback(err);
		}

		var date = stats["ctime"].toISOString();
		date = date.slice(0, 10);

		var fileSizeInBytes = stats["size"];
		var size = (fileSizeInBytes / 1048576).toFixed(1);

		var link = "";

		var fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
		var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);

		getInfoFromPkg(filePath, fileExt, function (error, info) {
			link = 'http://' + domain + webPath + fileName;

			callback(null, {
				fileName: fileName,
				dateModified: date,
				dateExpired: info.expiration,
				fileSize: size,
				fileLink: link,
				iconLink: info.icon
			});
		});

	});
}

function readDir(webPath, fileExt, domain, resultCallback) {
	var localPath = "." + webPath;
	// Get content from metadata.json
	var contents = {};
	var cachedAppDataPath = localPath + 'metadata.json';

	if (fs.existsSync(cachedAppDataPath)) {
		contents = JSON.parse(fs.readFileSync(cachedAppDataPath));
	}

	fs.readdir(localPath, (err, files) => {
		var extFiles = files.filter((file) => file.endsWith(fileExt));
		async.map(extFiles, (fileName, callback) => {

			var filePath = localPath + fileName;

			var appInfo = contents[fileName];
			if (appInfo == null) {
				collectAppInfo(filePath, webPath, domain, (err, info) => {
					if (err) {
						callback(err);
						return;
					}

					contents[fileName] = info;
					callback(null, info);
				});
			} else {
				callback(null, appInfo);
			}

		}, (err, results) => {
			if (!err && typeof(resultCallback) == "function") {
				fs.writeFileSync(cachedAppDataPath, JSON.stringify(contents));
				resultCallback(results);
			}
		});
	});
}

router.get('/ios-apps', (req, res) => {
	var iosPath = '/data/ios/';
	var iosExt = '.ipa';
	var domain = req.headers.host;
	readDir(iosPath, iosExt, domain, (results) => {
		res.send(results);
	});
});

router.get('/android-apps', (req, res) => {
	var androidPath = '/data/android/';
	var androidExt = '.apk';
	readDir(androidPath, androidExt, null, (results) => {
		res.send(results);
	});
});

module.exports = router;

