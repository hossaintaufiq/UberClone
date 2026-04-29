// routes/rides.js  ← REPLACE your existing file with this
var express = require('express');
var router  = express.Router();
var ride    = require('../controllers/rideController');
var auth    = require('../middleware/auth');

router.post('/',                  auth.protect, auth.authorize('rider'),           ride.requestRide);
router.get('/:id',                auth.protect, auth.authorize('rider','driver','super_admin','moderator','support'), ride.getRide);
router.patch('/:id/accept',       auth.protect, auth.authorize('driver'),          ride.acceptRide);
router.patch('/:id/arrived',      auth.protect, auth.authorize('driver'),          ride.driverArrived);
router.patch('/:id/start',        auth.protect, auth.authorize('driver'),          ride.startRide);
router.patch('/:id/complete',     auth.protect, auth.authorize('driver'),          ride.completeRide);
router.patch('/:id/cancel',       auth.protect, auth.authorize('rider','driver'),  ride.cancelRide);
router.post('/:id/rate-driver',   auth.protect, auth.authorize('rider'),           ride.rateDriver);
router.post('/:id/rate-rider',    auth.protect, auth.authorize('driver'),          ride.rateRider);
router.post('/:id/pay',           auth.protect, auth.authorize('rider'),           ride.processPayment);
router.get('/:id/track',          auth.protect, auth.authorize('rider','driver','super_admin','moderator','support'), ride.trackRide);

module.exports = router;