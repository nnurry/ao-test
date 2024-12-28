const { Elevator } = require('./elevator');
const { ElevatorDirection: Direction, ElevatorState: State } = require("./enums");
const { Scheduler } = require('./scheduler');
const configs = require("./configs");

const elevatorConfigs = [
    [1, configs.Elevator.Standard.maxFloor, 1],
    [2, configs.Elevator.Standard.maxFloor, 1],
    [3, configs.Elevator.Standard.maxFloor, 1],
];

const elevators = elevatorConfigs.map(cfg => new Elevator(...cfg));

const scheduler = new Scheduler(
    elevators,
    configs.Elevator.Standard.waitTime,
    configs.Elevator.Standard.moveTime,
);

scheduler.startElevators();

class ElevatorController {
    // Call an elevator to a specific floor and direction
    static handleCallRequest (req, res) {
        const { floor, direction } = req.body;

        if (
            typeof floor !== 'number' ||
            floor <= 0 ||
            ![Direction.UP, Direction.DOWN].includes(direction)
        ) {
            return res.status(400).json({ error: "Invalid request." });
        }

        scheduler.processRequest(parseInt(floor), direction);
        res.json({
            message: `Elevator called.`,
        });
    }

    // Get the current status for all elevators
    static handleGetElevatorStatus (req, res) {
        const result = scheduler.getStatus();
        res.json(result);
    }

    // Open Elevator Door
    static async handleOpenDoor(req, res) {
        const { elevatorId, floor } = req.body;

        const elevator = elevators[elevatorId];
        if (elevator.state == State.MOVING) {
            return res.status(400).json({ error: `Elevator ${elevatorId} is moving, can't open door` });
        }
        if (elevator.currentFloor !== floor) {
            return res.status(400).json({ error: `Can't issue opening door at floor ${floor} for elevator ${elevatorId}` });
        }
        elevator.isOpen = true;
        const openPromise = elevator.openDoor(scheduler.waitTime);

        res.json({ message: `Elevator ${elevatorId} door opened`, elevatorState: elevator });
        // Does not affect the response
        // Only update internal state
        await openPromise.catch(e => e);
        elevator.isOpen = false;
    }

    // Close Elevator Door
    static async handleCloseDoor(req, res) {
        const { elevatorId, floor } = req.body;

        const elevator = elevators[elevatorId];
        if (!elevator.isOpen) {
            return res.status(400).json({ error: "Door is already closed" });
        }
        if (elevator.currentFloor !== floor) {
            return res.status(400).json({ error: `Can't issue closing door at floor ${floor} for elevator ${elevatorId}` });
        }
        await elevator.closeDoor().catch(e => e);

        res.json({ message: `Elevator ${elevatorId} door closed`, elevatorState: elevator });
    }
};

module.exports = ElevatorController;
