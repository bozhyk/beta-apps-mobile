const fs = require('fs');
const async = require('async');
const express = require('express');
const router = express.Router();
const PkgReader = require('isomorphic-pkg-reader');
const uuid = require('uuid/v4');
const cgbiToPng = require('cgbi-to-png');

function getInfoFromPkg(filePath, webPath, extension, callback) {

	console.log(`getting info for ipa: ${ filePath }`);

	var reader = new PkgReader(filePath, extension, { withIcon: true, iconType: 'buffer', searchResource: true });

	reader.parse(function(err, pkgInfo) {

		if (err) {
			console.log(err);
		}

		var iconPath = "." + webPath + "icons/";
		if (!fs.existsSync(iconPath)){
			fs.mkdirSync(iconPath);
		}

		var expirationDate = null;
		var pngBuffer = null;
		if (extension == 'ipa') {
			if (pkgInfo.mobileProvision) {
				expirationDate = pkgInfo.mobileProvision.ExpirationDate;
				if (expirationDate) {
					expirationDate = expirationDate.toISOString().substring(0, 10);
				}
			}

			pngBuffer = cgbiToPng.revert(pkgInfo.icon);
		} else {
			pngBuffer = pkgInfo.icon;
		}

		var iconFullPath = iconPath + uuid() + ".png";

		fs.writeFile(iconFullPath, pngBuffer, function () {
			var result = {
				icon: iconFullPath.substr(1)
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

		var fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
		var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);

		getInfoFromPkg(filePath, webPath, fileExt, function (error, info) {

			callback(null, {
				fileName: fileName,
				dateModified: date,
				dateExpired: info.expiration,
				fileSize: size,
				fileLink: webPath + fileName,
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

