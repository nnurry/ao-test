const Direction = {
    "UP": "up",
    "DOWN": "down",
    "IDLE": "idle",
};

class Elevator {
    // time = milisec
    constructor(id, floors, waitTime = 2000, moveTime = 1000) {
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
            console.log(`Elevator ${this.id}: No requests. Setting direction to IDLE.`);
            return;
        }

        const nextDest = this.requests[0];
        console.log(`Elevator ${this.id}: Current floor: ${this.curr}. Next destination: ${nextDest.floor}. Direction: ${this.dir}`);

        if (this.curr < nextDest.floor) {
            this.dir = Direction.UP;
            this.curr++;
            console.log(`Elevator ${this.id}: Moving UP to floor ${this.curr}.`);
        } else if (this.curr > nextDest.floor) {
            this.dir = Direction.DOWN;
            this.curr--;
            console.log(`Elevator ${this.id}: Moving DOWN to floor ${this.curr}.`);
        }

        if (this.curr === nextDest.floor) {
            console.log(`Elevator ${this.id}: Reached floor ${this.curr}. Opening doors.`);
            this.open();
            // Remove all requests for the current floor (important for same-floor opposite-direction requests)
            this.requests = this.requests.filter(req => req.floor !== this.curr);

            setTimeout(() => {
                console.log(`Elevator ${this.id}: Doors closing.`);
                this.close();
                // After closing the door, check if there are more requests, if none, set direction to idle
                if (this.requests.length === 0) {
                    this.dir = Direction.IDLE;
                    console.log(`Elevator ${this.id}: No remaining requests. Setting direction to IDLE.`);
                } else {
                    console.log(`Elevator ${this.id}: Remaining requests: ${JSON.stringify(this.requests)}`);
                }
            }, this.waitTime);
        }
    }

    open() {
        this.isOpen = true;
        console.log(`Elevator ${this.id}: Doors opened.`);
    }

    close() {
        this.isOpen = false;
        console.log(`Elevator ${this.id}: Doors closed.`);
    }
}

module.exports = { Elevator, Direction };
