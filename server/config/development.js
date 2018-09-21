module.exports = {
	port: 3000,
	db: process.env.MONGODB_URI || 'mongodb://localhost:27017/qooco-apps',
	// db: 'mongodb://qooco:qooco1@ds125211.mlab.com:25211/app-server',
	ios_apps_dir: "./data/ios/files/",
	android_apps_dir: "./data/android/files/",
 	appUpdatesFilePath: './data/AppUpdates2.txt'
};
