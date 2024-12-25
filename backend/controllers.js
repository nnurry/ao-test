const { Elevator, Direction } = require('./elevator');
const { Scheduler } = require('./scheduler');

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
    // Call an elevator to a specific floor and direction
    callElevator: (req, res) => {
        const { elevatorId, floor, direction } = req.body;

        if (
            !Object.hasOwn(elevators, elevatorId) ||
            typeof floor !== 'number' ||
            floor <= 0 ||
            ![Direction.UP, Direction.DOWN].includes(direction)
        ) {
            return res.status(400).json({ error: "Invalid request." });
        }

        const elevator = elevators[elevatorId];

        scheduler.call(elevator, parseInt(floor), direction);
        res.json({
            message: `Elevator called.`,
            elevatorState: { curr: elevator.curr, dir: elevator.dir, requests: elevator.requests },
        });
    },

    // Get the current requests for all elevators
    getAllElevatorRequests: (req, res) => {
        const result = Object.entries(elevators).map(([id, elevator]) => ({
            id,
            requests: elevator.requests,
        }));
        res.json(result);
    },

    // Get the current status for all elevators
    getAllElevatorStatus: (req, res) => {
        const result = Object.entries(elevators).map(([id, elevator]) => ({
            id,
            currentFloor: elevator.curr,
            direction: elevator.dir,
            isMoving: elevator.isMoving,
            isOpen: elevator.isOpen,
            requests: elevator.requests,
        }));
        res.json(result);
    },

    // Open Elevator Door
    async openDoor(req, res) {
        const { elevatorId, floor } = req.body;

        const elevator = elevators[elevatorId];
        if (elevator.isMoving) {
            return res.status(400).json({ error: `Elevator ${elevatorId} is moving, can't open door` });
        }
        if (elevator.curr !== floor) {
            return res.status(400).json({ error: `Can't issue opening door at floor ${floor} for elevator ${elevatorId}` });
        }
        elevator.isOpen = true;
        const openPromise = elevator.open();

        res.json({ message: `Elevator ${elevatorId} door opened`, elevatorState: elevator });
        // Does not affect the response
        // Only update internal state
        await openPromise.catch(e => e);
        elevator.isOpen = false;
    },

    // Close Elevator Door
    async closeDoor(req, res) {
        const { elevatorId, floor } = req.body;

        const elevator = elevators[elevatorId];
        if (!elevator.isOpen) {
            return res.status(400).json({ error: "Door is already closed" });
        }
        if (elevator.curr !== floor) {
            return res.status(400).json({ error: `Can't issue closing door at floor ${floor} for elevator ${elevatorId}` });
        }
        await elevator.close().catch(e => e);

        res.json({ message: `Elevator ${elevatorId} door closed`, elevatorState: elevator });
    },
};

module.exports = elevatorController;
