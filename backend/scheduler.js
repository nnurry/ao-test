const { ElevatorDirection: Direction, ElevatorState: State, ElevatorDirection } = require("./enums");

class OldScheduler {
    constructor() {
        // there might be some internal states
    }

    costFunction(elevator, upFirst = true, ...segments) {
        let currentFloor = elevator.curr;

        let moveTime = 0;
        let waitTime = 0;

        const order = upFirst ? [0, 1, 2] : [2, 1, 0];
        for (const idx of order) {
            const segment = segments[idx];
            if (segment && segment.length > 0) {
                const targetFloor = segment[segment.length - 1].floor;
                const segmentMoveTime = Math.abs(targetFloor - currentFloor) * elevator.moveTime;
                const segmentWaitTime = segment.length * elevator.waitTime;
                moveTime += segmentMoveTime;
                waitTime += segmentWaitTime;
                currentFloor = targetFloor;
            }
        }
        console.log(
            `Cost calculation (upFirst: ${upFirst}): moveTime=${moveTime}, waitTime=${waitTime}, total=${moveTime + waitTime}`
        );
        return moveTime + waitTime;
    }

    scheduleMoveUpFirst(elevator, ups, downs) {
        console.log(`Scheduling move up first. Current floor: ${elevator.curr}`);
        let endOfSmallers = 0;
        for (let i = 0; i < ups.length; i++) {
            if (ups[i] >= elevator.curr) {
                break;
            }
            endOfSmallers = i;
        }
        const segmented = endOfSmallers > 0
            ? [ups.slice(endOfSmallers), downs, ups.slice(0, endOfSmallers)]
            : [ups, downs, []];
        console.log("Segments for up first:", JSON.stringify(segmented));
        return segmented;
    }

    scheduleMoveDownFirst(elevator, ups, downs) {
        console.log(`Scheduling move down first. Current floor: ${elevator.curr}`);
        let endOfBiggers = 0;
        for (let i = 0; i < downs.length; i++) {
            if (downs[i] <= elevator.curr) {
                break;
            }
            endOfBiggers = i;
        }
        const segmented = endOfBiggers > 0
            ? [downs.slice(endOfBiggers), ups, downs.slice(0, endOfBiggers)]
            : [downs, ups, []];
        console.log("Segments for down first:", JSON.stringify(segmented));
        return segmented;
    }

    schedule(elevator) {
        console.log(`Starting scheduling for elevator ${elevator.id}. Current direction: ${elevator.dir}`);
        const upRequests = elevator.requests
            .filter(req => req.dir === Direction.UP)
            .sort((a, b) => a.floor - b.floor);
        const downRequests = elevator.requests
            .filter(req => req.dir === Direction.DOWN)
            .sort((a, b) => b.floor - a.floor);

        console.log("Up requests:", JSON.stringify(upRequests));
        console.log("Down requests:", JSON.stringify(downRequests));

        if (elevator.dir === Direction.UP) {
            const segmentedMoves = this.scheduleMoveUpFirst(elevator, upRequests, downRequests);
            console.log("Scheduled moves (up first):", JSON.stringify(segmentedMoves));
            return segmentedMoves.flat();
        } else if (elevator.dir === Direction.DOWN) {
            const segmentedMoves = this.scheduleMoveDownFirst(elevator, upRequests, downRequests);
            console.log("Scheduled moves (down first):", JSON.stringify(segmentedMoves));
            return segmentedMoves.flat();
        } else {
            const segmentedUpMoves = this.scheduleMoveUpFirst(elevator, upRequests, downRequests);
            const segmentedDownMoves = this.scheduleMoveDownFirst(elevator, upRequests, downRequests);
            const costOfUpFirst = this.costFunction(elevator, true, ...segmentedUpMoves);
            const costOfDownFirst = this.costFunction(elevator, false, ...segmentedDownMoves);
            console.log(`Cost (up first): ${costOfUpFirst}, Cost (down first): ${costOfDownFirst}`);
            const chooseUp = costOfUpFirst <= costOfDownFirst;
            console.log(`Optimal direction: ${chooseUp ? "Up first" : "Down first"}`);
            return chooseUp ? segmentedUpMoves.flat() : segmentedDownMoves.flat();
        }
    }

    call(elevator, floor, dir) {
        console.log(`Call received: Floor ${floor}, Direction ${dir}, Elevator ${elevator.id}`);
        const isDuplicated = elevator.requests.some((req) =>
            req.floor === floor && req.dir === dir
        );

        if (!isDuplicated) {
            elevator.requests.push({ floor, dir });
            console.log(`New request added. Requests:`, JSON.stringify(elevator.requests));
            elevator.schedule = this.schedule(elevator);
        } else {
            console.log("Duplicate request ignored.");
        }
    }
}

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

    costFunction(elevator, floor, direction) {
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
                return Math.abs(elevator.currentFloor - floor);
            }
        }
        // Too big cost
        return Infinity;
    }

    processRequest(floor, direction) {
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
            if (elevator.requests < minRequests) {
                minRequests = elevator.requests;
                leastCrowdedElevator = elevator;
            }
        });

        if (suitableElevator) {
            console.log("Found suitable elevator:", suitableElevator.id);
            suitableElevator.addRequest(floor);
        } else {
            console.log("Found least crowded elevator:", leastCrowdedElevator.id);
            leastCrowdedElevator.addRequest(floor);
        }
    }

    getStatus() {
        const elevatorStatuses = this.elevators.map(elevator => elevator.getStatus());
        return elevatorStatuses;
    }
}

module.exports = { Scheduler };
