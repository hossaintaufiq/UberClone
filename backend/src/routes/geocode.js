const express = require("express");
const geocode = require("../controllers/geocodeController");

const router = express.Router();

router.get("/search", geocode.searchPlaces);

module.exports = router;
