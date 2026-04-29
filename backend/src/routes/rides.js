// routes/rides.js  ← REPLACE your existing file with this
var express = require('express');
var router  = express.Router();
var ride    = require('../controllers/rideController');
var auth    = require('../middleware/auth');

router.post('/',                  auth.protect, auth.authorize('user','rider'),    ride.requestRide);
router.get('/:id',                auth.protect, auth.authorize('user','rider','driver','super_admin','moderator','support'), ride.getRide);
router.patch('/:id/accept',       auth.protect, auth.authorize('driver'),          ride.acceptRide);
router.patch('/:id/reject',       auth.protect, auth.authorize('driver'),          ride.rejectRide);
router.patch('/:id/arrived',      auth.protect, auth.authorize('driver'),          ride.driverArrived);
router.patch('/:id/start',        auth.protect, auth.authorize('driver'),          ride.startRide);
router.patch('/:id/complete',     auth.protect, auth.authorize('driver'),          ride.completeRide);
router.patch('/:id/cancel',       auth.protect, auth.authorize('user','rider','driver'),  ride.cancelRide);
router.post('/:id/rate-driver',   auth.protect, auth.authorize('user','rider'),    ride.rateDriver);
router.post('/:id/rate-rider',    auth.protect, auth.authorize('driver'),          ride.rateRider);
router.post('/:id/pay',           auth.protect, auth.authorize('user','rider'),    ride.processPayment);
router.get('/:id/track',          auth.protect, auth.authorize('user','rider','driver','super_admin','moderator','support'), ride.trackRide);
router.get('/:id/chat',           auth.protect, auth.authorize('user','rider','driver'), ride.getRideChat);
router.post('/:id/chat',          auth.protect, auth.authorize('user','rider','driver'), ride.sendRideChat);

module.exports = router;