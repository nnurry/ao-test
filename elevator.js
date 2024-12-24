const Direction = {
    "UP": "up",
    "DOWN": "down",
    "IDLE": "idle",
};

class Elevator {
    // time = milisec
    constructor(id, floors, waitTime = 2000, moveTime = 250) {
        this.id = id;
        this.curr = 1;
        this.dir = Direction.IDLE; // "up", "down", "idle"
        this.requests = [];
        this.floors = floors;
        this.isOpen = false;
        this.waitTime = waitTime;
        this.moveTime = moveTime;
    }

    move() {
        if (this.requests.length === 0) {
            this.dir = Direction.IDLE;
            return;
        }

        const nextDest = this.requests[0];

        if (this.curr < nextDest.floor) {
            this.dir = Direction.UP;
            this.curr++;
        }

        else if (this.curr > nextDest.floor) {
            this.dir = Direction.DOWN;
            this.curr--;
        }

        if (this.curr === nextDest.floor) {
            this.open();
            // Remove all requests for the current floor (important for same-floor opposite-direction requests)
            this.requests = this.requests.filter(req => req.floor !== this.curr);

            clearTimeout()
            setTimeout(() => {
                this.close();
                // After closing the door, check if there are more requests, if none, set direction to idle
                if (this.requests.length === 0) {
                    this.dir = Direction.IDLE;
                }
            }, this.waitTime);
        }
    }

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }
}

class Scheduler {
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
        return moveTime + waitTime;
    }

    scheduleMoveUpFirst(elevator, ups, downs) {
        // sort the up requests
        // move requests of lower floors to the end of the list
        let endOfSmallers = 0;
        for (let i = 0; i < ups.length; i++) {
            if (ups[i] >= elevator.curr) {
                break;
            }
            endOfSmallers = i;
        }
        if (endOfSmallers > 0) {
            return [ups.slice(endOfSmallers), downs, ups.slice(0, endOfSmallers)];
        }
        return [ups, downs, []];
    }
    scheduleMoveDownFirst(elevator, ups, downs) {
        // sort the down requests
        // move requests of higher floors to the end of the list
        let endOfBiggers = 0;
        for (let i = 0; i < downs.length; i++) {
            if (downs[i] <= elevator.curr) {
                break;
            }
            endOfBiggers = i;
        }
        if (endOfBiggers > 0) {
            return [downs.slice(endOfBiggers), ups, downs.slice(0, endOfBiggers)];
        }
        return [downs, ups, []];
    }

    schedule(elevator) {
        const upRequests = elevator.requests.filter(req => req.dir === Direction.UP).sort((a, b) => a.floor < b.floor);
        const downRequests = elevator.requests.filter(req => req.dir === Direction.DOWN).sort((a, b) => a.floor > b.floor);

        if (elevator.dir === Direction.UP) {
            // sort the up requests
            // move requests of lower floors to the end of the list
            const segmentedMoves = this.scheduleMoveUpFirst(elevator, upRequests, downRequests);
            return segmentedMoves.flat();
        }
        else if (elevator.dir === Direction.DOWN) {
            // sort the down requests
            // move requests of higher floors to the end of the list
            const segmentedMoves = this.scheduleMoveDownFirst(elevator, upRequests, downRequests);
            return segmentedMoves.flat();
        }
        else {
            // find optimal trip (down first or up first)
            const segmentedUpMoves = this.scheduleMoveUpFirst(elevator, upRequests, downRequests);
            const segmentedDownMoves = this.scheduleMoveDownFirst(elevator, upRequests, downRequests);
            const costOfUpFirst = this.costFunction(elevator, true, ...segmentedUpMoves);
            const costOfDownFirst = this.costFunction(elevator, false, ...segmentedDownMoves);
            const chooseUp = costOfUpFirst > costOfDownFirst;
            return chooseUp ? segmentedUpMoves.flat() : segmentedDownMoves.flat();
        }
    }

    call(elevator, floor, dir) {
        const isDuplicated = elevator.requests.some((req) =>
            req.floor === floor
            && req.direction === dir
        );

        if (!isDuplicated) {
            elevator.requests.push({ floor, dir });
            elevator.schedule = this.schedule(elevator);
        }
    }
}

module.exports = { Elevator, Scheduler, Direction };