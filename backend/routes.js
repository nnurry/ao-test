const express = require('express');
const router = express.Router();
const ElevatorController = require('./controllers');

router.post('/call', ElevatorController.handleCallRequest);
router.get('/status/all', ElevatorController.handleGetElevatorStatus);
router.post('/open', ElevatorController.handleOpenDoor);
router.post('/close', ElevatorController.handleCloseDoor);

module.exports = router;
