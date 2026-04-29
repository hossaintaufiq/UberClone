// routes/admin.js  ← REPLACE your existing file with this
var express = require('express');
var router  = express.Router();
var admin   = require('../controllers/adminController');

router.get('/dashboard',                 admin.getDashboard);
router.get('/riders',                    admin.getRiders);
router.get('/riders/:id',                admin.getRiderDetail);
router.patch('/riders/:id/status',       admin.updateRiderStatus);
router.get('/drivers',                   admin.getDrivers);
router.get('/drivers/:id',               admin.getDriverDetail);
router.patch('/drivers/:id/status',      admin.updateDriverStatus);
router.patch('/drivers/:id/ride-access', admin.updateDriverRideAccess);
router.patch('/drivers/:id/verify-docs', admin.verifyDriverDocs);
router.get('/rides',                     admin.getRides);
router.get('/complaints',                admin.getComplaints);
router.patch('/complaints/:id',          admin.updateComplaint);
router.get('/revenue',                   admin.getRevenue);
router.get('/config',                    admin.getConfig);
router.patch('/config',                  admin.updateConfig);
router.post('/promo-codes',              admin.createPromoCode);
router.patch('/promo-codes/:code/toggle', admin.togglePromoCode);

module.exports = router;