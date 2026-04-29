const router = require('express').Router();
const ctrl   = require('../controllers/authController');

// browser test routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Auth route working'
  });
});

router.get('/rider/register', (req, res) => {
  res.json({
    success: true,
    message: 'Rider register page route is working. Use POST here from Postman or frontend.'
  });
});

router.get('/rider/login', (req, res) => {
  res.json({
    success: true,
    message: 'Rider login page route is working. Use POST here from Postman or frontend.'
  });
});

router.get('/driver/register', (req, res) => {
  res.json({
    success: true,
    message: 'Driver register page route is working. Use POST here from Postman or frontend.'
  });
});

router.get('/driver/login', (req, res) => {
  res.json({
    success: true,
    message: 'Driver login page route is working. Use POST here from Postman or frontend.'
  });
});

router.get('/admin/login', (req, res) => {
  res.json({
    success: true,
    message: 'Admin login page route is working. Use POST here from Postman or frontend.'
  });
});

// real API routes
router.post('/rider/register',        ctrl.riderRegister);
router.post('/rider/login',           ctrl.riderLogin);
router.post('/rider/verify-otp',      ctrl.riderVerifyOTP);
router.post('/rider/forgot-password', ctrl.riderForgotPassword);
router.post('/rider/reset-password',  ctrl.riderResetPassword);

router.post('/driver/register',       ctrl.driverRegister);
router.post('/driver/login',          ctrl.driverLogin);
router.post('/driver/verify-otp',     ctrl.driverVerifyOTP);

router.post('/admin/login',           ctrl.adminLogin);

module.exports = router;