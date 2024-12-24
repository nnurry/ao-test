const { Elevator, Scheduler, Direction } = require("./elevator.js");

// Example usage demonstrating the scenarios:
const elevator = new Elevator(1, 10);
const scheduler = new Scheduler();

// Scenario 1: Single Upward Request
console.log("Scenario 1: Single Upward Request");
scheduler.call(elevator, 2, Direction.UP);
setInterval(() => elevator.move(), elevator.moveTime);

setTimeout(() => {
    clearInterval(interval);
    elevator.requests = [];
    elevator.curr = 1;
    elevator.dir = Direction.IDLE;

    // Scenario 2: Multiple Upward Requests
    console.log("\nScenario 2: Multiple Upward Requests");
    scheduler.call(elevator, 3, Direction.UP);
    scheduler.call(elevator, 4, Direction.UP);
    interval = setInterval(() => elevator.move(), elevator.moveTime);
}, 5000)

let interval = null;

setTimeout(() => {
    clearInterval(interval);
    elevator.requests = [];
    elevator.curr = 3;
    elevator.dir = Direction.UP;

    // Scenario 3: Mixed Requests
    console.log("\nScenario 3: Mixed Requests");
    scheduler.call(elevator, 5, Direction.UP);
    scheduler.call(elevator, 1, Direction.DOWN);
    interval = setInterval(() => elevator.move(), elevator.moveTime);
}, 10000)

setTimeout(() => {
    clearInterval(interval);
    elevator.requests = [];
    elevator.curr = 2;
    elevator.dir = Direction.IDLE;

    // Scenario 4: Same Floor, Opposite Direction Requests
    console.log("\nScenario 4: Same Floor, Opposite Direction Requests");
    scheduler.call(elevator, 2, Direction.UP);
    scheduler.call(elevator, 2, Direction.DOWN);
    interval = setInterval(() => elevator.move(), elevator.moveTime);
}, 15000)
