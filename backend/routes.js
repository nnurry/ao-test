const express = require('express');
const router = express.Router();
const elevatorController = require('./controllers');

router.post('/call', elevatorController.callElevator);
router.get('/status/all', elevatorController.getAllElevatorStatus);
router.get('/requests/all', elevatorController.getAllElevatorRequests);

module.exports = router;
