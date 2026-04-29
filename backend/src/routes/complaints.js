// routes/complaints.js  ← REPLACE your existing file with this
var express    = require('express');
var router     = express.Router();
var complaint  = require('../controllers/complaintController');
var auth       = require('../middleware/auth');

router.post('/',    auth.protect, auth.authorize('rider'),                                      complaint.fileComplaint);
router.get('/',     auth.protect, auth.authorize('rider'),                                      complaint.getMyComplaints);
router.get('/:id',  auth.protect, auth.authorize('rider','super_admin','moderator','support'),  complaint.getComplaint);

module.exports = router;