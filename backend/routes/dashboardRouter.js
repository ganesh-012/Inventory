const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const router = express.Router();

router.get('/getStats', getDashboardStats)

module.exports = router