const express = require('express'),
	  router = express.Router(),
	  authController = require('../controllers/auth.controller'),
	  appsController = require('../controllers/apps.controller');

router.get('/ios-apps', appsController.getiOSApps);
router.get('/android-apps', appsController.getAndroidApps);

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

