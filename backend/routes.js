const express = require('express');
const router = express.Router();
const elevatorController = require('./controllers');

router.post('/call', elevatorController.callElevator);
router.get('/status', elevatorController.getCurrentFloor);
router.get('/requests', elevatorController.getRequests);

module.exports = router;
