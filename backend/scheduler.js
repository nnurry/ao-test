const { ElevatorDirection: Direction, ElevatorState: State, ElevatorDirection } = require("./enums");

class Scheduler {
    constructor(elevators, waitTime, moveTime) {
        this.elevators = elevators;
        this.waitTime = waitTime;
        this.moveTime = moveTime;
    }

    startElevators() {
        // Start the elevator movement in background
        this.jobs = this.elevators.map(
            elevator => setInterval(() => elevator.move(this.waitTime), this.moveTime)
        );
    }

    resetElevators() {
        this.elevators.forEach(elevator => elevator.resetState());
    }

    stopElevators() {
        this.jobs.forEach(job => clearTimeout(job));
    }

    costFunction(elevator, floor, direction) {
        if (elevator.currentFloor == floor) {
            return 0;
        }
        if (elevator.state == State.IDLE) {
            return Math.abs(elevator.currentFloor - floor);
        }
        if (elevator.direction == direction) {
            // can fetch when it is at least 2 floors away to compensate
            // for deceleration
            let isDistantEnough = false;
            if (direction == Direction.UP && elevator.currentFloor + 1 < floor) {
                // i.e: 3 can fetch 5, but not 4
                isDistantEnough = true;
            }
            if (direction == Direction.DOWN && elevator.currentFloor - 1 > floor) {
                // i.e: 7 can fetch 5, but not 6
                isDistantEnough = true;
            }
            if (isDistantEnough) {
                const currentLoad = elevator.requests[direction].length;
                return Math.abs(elevator.currentFloor - floor) + currentLoad;
            }
        }
        // Too big cost
        return Infinity;
    }

    processRequest(floor, direction = null, elevatorId = null) {
        if (elevatorId != null) {
            if (floor == this.elevators[elevatorId].currentFloor) {
                console.log("Elevator is available on the same floor.")
                return;
            }
            if (direction == null) {
                direction = floor > this.elevators[elevatorId].currentFloor ? Direction.UP : Direction.DOWN;
            }
            console.log(`Designate elevator ${elevatorId} to go to floor ${floor} with direction ${direction}`);
            this.elevators[elevatorId].addRequest(floor, direction);
            return;
        }
        let minCost = Infinity;
        let minRequests = Infinity;
        let suitableElevator = null;
        let leastCrowdedElevator = null;
        this.elevators.forEach((elevator) => {
            const currentCost = this.costFunction(elevator, floor, direction);
            if (currentCost < minCost) {
                minCost = currentCost;
                suitableElevator = elevator;
            }
            if (elevator.requests[direction] < minRequests) {
                minRequests = elevator.requests[direction];
                leastCrowdedElevator = elevator;
            }
        });

        if (suitableElevator) {
            console.log("Found suitable elevator:", suitableElevator.id);
            suitableElevator.addRequest(floor, direction);
        } else {
            console.log("Found least crowded elevator:", leastCrowdedElevator.id);
            leastCrowdedElevator.addRequest(floor, direction);
        }
    }

    getStatus() {
        const elevatorStatuses = this.elevators.map(elevator => elevator.getStatus());
        return elevatorStatuses;
    }
}

module.exports = { Scheduler };
