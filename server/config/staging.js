module.exports = {
	port: process.env.PORT || 3002,
	db: process.env.MONGODB_URI || 'mongodb://localhost:27017/qooco-apps',
	ios_apps_dir: "/data/resources/web/html/cloudapp/AppUpdates/QoocoTalk/iOS/",
	android_apps_dir: "/data/resources/web/html/cloudapp/AppUpdates/QoocoTalk/Android/",
	appUpdatesFilePath: '/data/resources/web/html/cloudapp/AppUpdates/QoocoTalk/Android/AppUpdates2.txt'
};
