// routes/riders.js  ← REPLACE your existing file with this
var express = require('express');
var router  = express.Router();
var ctrl    = require('../controllers/riderController');
var auth    = require('../middleware/auth');
var upload  = require('../middleware/upload');

router.use(auth.protect, auth.authorize('user','rider'));

router.get('/profile',       ctrl.getProfile);
router.put('/profile',       upload.uploadPhoto, ctrl.updateProfile);
router.put('/fcm-token',     ctrl.updateFcmToken);
router.get('/rides',         ctrl.getRides);
router.get('/payments',      ctrl.getPayments);
router.get('/notifications', ctrl.getNotifications);

module.exports = router;