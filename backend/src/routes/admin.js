// routes/admin.js  ← REPLACE your existing file with this
var express = require('express');
var router  = express.Router();
var admin   = require('../controllers/adminController');
var auth    = require('../middleware/auth');

var isAdmin = [auth.protect, auth.authorize('super_admin','moderator','support')];

router.get('/dashboard',                 isAdmin[0], isAdmin[1], admin.getDashboard);
router.get('/riders',                    isAdmin[0], isAdmin[1], admin.getRiders);
router.get('/riders/:id',                isAdmin[0], isAdmin[1], admin.getRiderDetail);
router.patch('/riders/:id/status',       isAdmin[0], isAdmin[1], admin.updateRiderStatus);
router.get('/drivers',                   isAdmin[0], isAdmin[1], admin.getDrivers);
router.get('/drivers/:id',               isAdmin[0], isAdmin[1], admin.getDriverDetail);
router.patch('/drivers/:id/status',      isAdmin[0], isAdmin[1], admin.updateDriverStatus);
router.patch('/drivers/:id/ride-access', isAdmin[0], isAdmin[1], admin.updateDriverRideAccess);
router.patch('/drivers/:id/verify-docs', isAdmin[0], isAdmin[1], admin.verifyDriverDocs);
router.get('/rides',                     isAdmin[0], isAdmin[1], admin.getRides);
router.get('/complaints',                isAdmin[0], isAdmin[1], admin.getComplaints);
router.patch('/complaints/:id',          isAdmin[0], isAdmin[1], admin.updateComplaint);
router.get('/revenue',                   isAdmin[0], isAdmin[1], admin.getRevenue);

module.exports = router;