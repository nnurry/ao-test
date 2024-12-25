const { get } = require('http');
const { Elevator, Direction } = require('./elevator');
const { Scheduler } = require('./scheduler');
const e = require('express');

const elevators = {
    "1": new Elevator(1, 10),
    "2": new Elevator(2, 10),
    "3": new Elevator(3, 10),
}; // 3 elevators

// Start the elevator movement in background
const moveElevatorsCron = {
    "1": setInterval(() => elevators["1"].move(), elevators["1"].moveTime),
    "2": setInterval(() => elevators["2"].move(), elevators["2"].moveTime),
    "3": setInterval(() => elevators["3"].move(), elevators["3"].moveTime),
};

const scheduler = new Scheduler();

const elevatorController = {
    callElevator: (req, res) => {
        const { elevatorId, floor, direction } = req.body;

        if (
            !Object.hasOwn(elevator, elevatorId)
            || !floor
            || !direction
            || ![Direction.UP, Direction.DOWN].includes(direction)
        ) {
            return res.status(400).json({ error: "Invalid request. Provide floor and direction (up/down)." });
        }

        const elevator = elevators[elevatorId];

        scheduler.call(elevator, parseInt(floor), direction);
        res.json({ message: `Elevator called.`, elevatorState: { curr: elevator.curr, dir: elevator.dir, requests: elevator.requests } }); // Return elevator states
    },
    getCurrentFloor: (req, res) => {
        res.json({ currentFloor: elevator.curr, direction: elevator.dir });
    },
    getRequests: (req, res) => {
        res.json({ requests: elevator.requests });
    }
};

module.exports = elevatorController;
