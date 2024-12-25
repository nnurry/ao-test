const { Elevator, Direction } = require("./elevator.js");
const { Scheduler } = require("./scheduler.js");

// Example usage demonstrating the scenarios:
const elevator = new Elevator(1, 10);
const scheduler = new Scheduler();

console.log("Starting Elevator Simulation\n");

// Scenario 1: Single Upward Request
console.log("Scenario 1: Single Upward Request");
scheduler.call(elevator, 2, Direction.UP);
console.log("Request added: Floor 2, Direction UP");

let interval = setInterval(() => {
    console.log(`Elevator moving. Current floor: ${elevator.curr}, Direction: ${elevator.dir}`);
    elevator.move();
}, elevator.moveTime);

setTimeout(() => {
    console.log("\nEnding Scenario 1");
    clearInterval(interval);
    elevator.requests = [];
    elevator.curr = 1;
    elevator.dir = Direction.IDLE;

    // Scenario 2: Multiple Upward Requests
    console.log("\nScenario 2: Multiple Upward Requests");
    scheduler.call(elevator, 3, Direction.UP);
    console.log("Request added: Floor 3, Direction UP");
    scheduler.call(elevator, 4, Direction.UP);
    console.log("Request added: Floor 4, Direction UP");

    interval = setInterval(() => {
        console.log(`Elevator moving. Current floor: ${elevator.curr}, Direction: ${elevator.dir}`);
        elevator.move();
    }, elevator.moveTime);
}, 5000);

setTimeout(() => {
    console.log("\nEnding Scenario 2");
    clearInterval(interval);
    elevator.requests = [];
    elevator.curr = 3;
    elevator.dir = Direction.UP;

    // Scenario 3: Mixed Requests
    console.log("\nScenario 3: Mixed Requests");
    scheduler.call(elevator, 5, Direction.UP);
    console.log("Request added: Floor 5, Direction UP");
    scheduler.call(elevator, 1, Direction.DOWN);
    console.log("Request added: Floor 1, Direction DOWN");

    interval = setInterval(() => {
        console.log(`Elevator moving. Current floor: ${elevator.curr}, Direction: ${elevator.dir}`);
        elevator.move();
    }, elevator.moveTime);
}, 10000);

setTimeout(() => {
    console.log("\nEnding Scenario 3");
    clearInterval(interval);
    elevator.requests = [];
    elevator.curr = 2;
    elevator.dir = Direction.IDLE;

    // Scenario 4: Same Floor, Opposite Direction Requests
    console.log("\nScenario 4: Same Floor, Opposite Direction Requests");
    scheduler.call(elevator, 2, Direction.UP);
    console.log("Request added: Floor 2, Direction UP");
    scheduler.call(elevator, 2, Direction.DOWN);
    console.log("Request added: Floor 2, Direction DOWN");

    interval = setInterval(() => {
        console.log(`Elevator moving. Current floor: ${elevator.curr}, Direction: ${elevator.dir}`);
        elevator.move();
    }, elevator.moveTime);
}, 15000);

setTimeout(() => {
    console.log("\nEnding Scenario 4");
    clearInterval(interval);
    console.log("Elevator simulation completed.");
}, 20000);
