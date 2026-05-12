const express = require("express");
const geocode = require("../controllers/geocodeController");

const router = express.Router();

router.get("/search", geocode.searchPlaces);
router.get("/reverse", geocode.reversePlace);

module.exports = router;
