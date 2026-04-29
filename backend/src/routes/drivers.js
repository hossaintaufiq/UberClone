// routes/drivers.js  ← REPLACE your existing file with this
var express = require('express');
var router  = express.Router();
var driver  = require('../controllers/driverController');
var auth    = require('../middleware/auth');
var upload  = require('../middleware/upload');

router.use(auth.protect, auth.authorize('driver'));

router.get('/profile',       driver.getProfile);
router.put('/profile',       upload.uploadPhoto, driver.updateProfile);
router.patch('/go-online',   driver.toggleOnline);
router.patch('/location',    driver.updateLocation);
router.get('/rides',         driver.getRides);
router.get('/earnings',      driver.getEarnings);
router.post('/documents',    upload.uploadDocument, driver.uploadDocument);
router.get('/documents',     driver.getDocuments);
router.get('/notifications', driver.getNotifications);
router.put('/fcm-token',     driver.updateFcmToken);

module.exports = router;