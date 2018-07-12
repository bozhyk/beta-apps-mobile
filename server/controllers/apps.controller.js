const fs = require('fs'),
	  async = require('async'),
	  PkgReader = require('isomorphic-pkg-reader'),
	  uuid = require('uuid/v4'),
	  cgbiToPng = require('cgbi-to-png'),
	  QRCode = require('qrcode'),
	  config = require('../config');

function getInfoFromPkg(filePath, webPath, extension, callback) {

	console.log(`getting info for app: ${ filePath }`);

	var reader = new PkgReader(filePath, extension, { withIcon: true, iconType: 'buffer', searchResource: true });

	reader.parse(function(err, pkgInfo) {

		if (err) {
			console.error(err);
		}

		if (!pkgInfo) {
			console.error("failed to parse app: " + filePath);
			var error = new Error("parsing app error");
			callback(error);
			return;
		}

		var iconPath = "." + webPath + "/icons/";

		if (!fs.existsSync(iconPath)){
			fs.mkdirSync(iconPath);
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

			if (pkgInfo.icon) {
				pngBuffer = cgbiToPng.revert(pkgInfo.icon);
			}
			version = pkgInfo.CFBundleShortVersionString;
			build = pkgInfo.CFBundleVersion;
			bundleId = pkgInfo.CFBundleIdentifier;
		} else {
			pngBuffer = pkgInfo.icon;
			version = pkgInfo.versionName;
			build = pkgInfo.versionCode;
			bundleId = pkgInfo.package;
		}

		var iconFullPath = iconPath + uuid() + ".png";

		fs.writeFile(iconFullPath, pngBuffer, function () {
			var result = {
				bundleId: bundleId,
				icon: iconFullPath.substr(2),
				version: version,
				build: build
			};

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

		var date = stats.mtime.toISOString();
		date = date.slice(0, 10);

		var time = stats.mtime.getTime();

		var fileSizeInBytes = stats["size"];
		var size = (fileSizeInBytes / 1048576).toFixed(1);

		var fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
		var fileExt = fileName.substring(fileName.lastIndexOf(".") + 1);

		var qrCodePath = "." + webPath + "/qrcode/";
		if (!fs.existsSync(qrCodePath)){
			fs.mkdirSync(qrCodePath);
		}

		var qrCodeFullPath = qrCodePath + uuid() + ".png";

		var fileLink = webPath + "/files/" + fileName;
		var installLink = null;
		if (domain.endsWith("/")) {
			domain = domain.slice(0, -1);
		}

		if (fileExt == "ipa") {
			installLink = "https://" + domain + fileLink.replace('.ipa', '.plist');
			installLink = 'itms-services://?action=download-manifest&amp;url=' + encodeURIComponent(installLink);
		} else {
			installLink = "http://" + domain + fileLink;
		}

		QRCode.toFile(qrCodeFullPath, installLink, {
			color: {
			  dark: '#000',  // Black dots
			  light: '#0000' // Transparent background
			}
		});

		getInfoFromPkg(filePath, webPath, fileExt, function (error, info) {
			if (error) {
				callback(error);
				return;
			}

			// Relative links used
			callback(null, {
				fileName: fileName,
				dateModified: date,
				timestamp: time,
				dateExpired: info.expiration,
				fileSize: parseFloat(size),
				fileLink: fileLink.substr(1),
				installLink: installLink,
				iconLink: info.icon,
				qrCode: qrCodeFullPath.substr(2),
				version: info.version,
				build: info.build,
				bundleId: info.bundleId,
				team: info.team
			});
		});
	});
}

function readDir(localPath, fileExt, domain, resultCallback) {
	// Get content from metadata.json
	var contents = {};
	var webPath = "/data/" + (fileExt == ".ipa" ? "ios" : "android");
	var cachedAppDataPath = "." + webPath + '/metadata.json';

	if (fs.existsSync(cachedAppDataPath)) {
		contents = JSON.parse(fs.readFileSync(cachedAppDataPath));
	}

	fs.readdir(localPath, (err, files) => {

		if (err) {
			console.error(err);
			resultCallback(err);
			return;
		}

		var needUpdateCache = false;
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
					needUpdateCache = true;
					callback(null, info);
				});
			} else {
				callback(null, appInfo);
			}

		}, (err, results) => {
			if (!err && typeof(resultCallback) == "function") {
				if (needUpdateCache) {
					console.log(`updating ${ cachedAppDataPath } file`);
					fs.writeFileSync(cachedAppDataPath, JSON.stringify(contents));
				}

				results = results.sort((a, b) => b.timestamp - a.timestamp);
				resultCallback(null, results);
			}
		});
	});
}

function getiOSApps(req, res) {
	var iosPath = config.ios_apps_dir;
	var ref = req.headers.referer;
	var domain = ref ? ref.substring(ref.indexOf("://") + 3) : req.headers.host;

	readDir(iosPath, '.ipa', domain, (error, results) => {
		if (error) {
			res.status(400).send(error);
		} else {
			res.send(results);
		}
	});
};

function getAndroidApps(req, res) {
	var androidPath = config.android_apps_dir;
	var ref = req.headers.referer;
	var domain = ref ? ref.substring(ref.indexOf("://") + 3) : req.headers.host;

	readDir(androidPath, '.apk', domain, (error, results) => {
		if (error) {
			res.status(400).send(error);
		} else {
			res.send(results);
		}
	});
}

module.exports = { getiOSApps, getAndroidApps };
