const fs = require('fs');
const async = require('async');
const express = require('express');
const router = express.Router();
const PkgReader = require('isomorphic-pkg-reader');
const uuid = require('uuid/v4');
const cgbiToPng = require('cgbi-to-png');
const QRCode = require('qrcode');


function getInfoFromPkg(filePath, webPath, extension, callback) {

	console.log(`getting info for ipa: ${ filePath }`);

	var reader = new PkgReader(filePath, extension, { withIcon: true, iconType: 'buffer', searchResource: true });

	reader.parse(function(err, pkgInfo) {

		if (err) {
			console.log(err);
		}

		var iconPath = "." + webPath + "icons/";
		var qrCodePath = "." + webPath + "qrcode/";

		if (!fs.existsSync(iconPath)){
			fs.mkdirSync(iconPath);
		}
		if (!fs.existsSync(qrCodePath)){
			fs.mkdirSync(qrCodePath);
		}

		var expirationDate = null,
			pngBuffer = null,
			bundleId = null;
			version = null,
			build = null,
			team = null;

		if (extension == 'ipa') {
			if (pkgInfo.mobileProvision) {
				expirationDate = pkgInfo.mobileProvision.ExpirationDate;
				if (expirationDate) {
					expirationDate = expirationDate.toISOString().substring(0, 10);
				}

				team = pkgInfo.mobileProvision.TeamName;
			}

			pngBuffer = cgbiToPng.revert(pkgInfo.icon);
			version = pkgInfo.CFBundleShortVersionString;
			build = pkgInfo.CFBundleVersion;
			bundleId = pkgInfo.CFBundleIdentifier;
		} else {
			pngBuffer = pkgInfo.icon;
			version = pkgInfo.versionName;
			build = pkgInfo.versionCode;
			bundleId = pkgInfo.package;
		}

		var id = uuid();
		var iconFullPath = iconPath + id + ".png";
		var qrCodeFullPath = qrCodePath + id + ".png";

		QRCode.toFile(qrCodeFullPath, filePath, {
			color: {
			  dark: '#000',  // Blue dots
			  light: '#0000' // Transparent background
			}
		});

		fs.writeFile(iconFullPath, pngBuffer, function () {
			var result = {
				bundleId: bundleId,
				icon: iconFullPath.substr(1),
				version: version,
				build: build
			};

			if (qrCodeFullPath) {
				result.qrCode = qrCodeFullPath.substr(1);
			}

			if (expirationDate) {
				result.expiration = expirationDate;
			}

			if (team) {
				result.team = team;
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
				iconLink: info.icon,
				qrCode: info.qrCode,
				version: info.version,
				build: info.build,
				bundleId: info.bundleId,
				team: info.team
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

