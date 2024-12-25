const Direction = {
    "UP": "up",
    "DOWN": "down",
    "IDLE": "idle",
};

class Elevator {
    constructor(id, floors, waitTime = 4000, moveTime = 500) {
        this.id = id;
        this.curr = 1;
        this.dir = Direction.IDLE;
        this.requests = [];
        this.floors = floors;
        this.isOpen = false;
        this.isMoving = false;
        this.waitTime = waitTime;
        this.moveTime = moveTime;
    }

    reset() {
        this.curr = 1;
        this.dir = Direction.IDLE;
        this.requests = [];
        this.isOpen = false;
        this.isMoving = false;
    }

    async move() {
        if (this.isMoving || this.isOpen) return; // Prevent moving if already moving or doors are open

        if (this.requests.length === 0) {
            if (this.dir !== Direction.IDLE) {
                console.log(`Elevator ${this.id}: No requests. Setting direction to IDLE.`);
                this.dir = Direction.IDLE;
            }
            return;
        }

        this.isMoving = true;

        const nextDest = this.requests[0]; // Get the next destination
        if (this.curr < nextDest.floor) {
            this.dir = Direction.UP;
            this.curr++;
            console.log(`Elevator ${this.id}: Moving UP to floor ${this.curr}.`);
        } else if (this.curr > nextDest.floor) {
            this.dir = Direction.DOWN;
            this.curr--;
            console.log(`Elevator ${this.id}: Moving DOWN to floor ${this.curr}.`);
        } else {
            console.log(`Elevator ${this.id}: Reached floor ${this.curr}. Opening doors.`);
            await this.open();

            // Remove all requests for the current floor
            this.requests = this.requests.filter(req => req.floor !== this.curr);

            await this.delay(this.waitTime); // Simulate door open time
            console.log(`Elevator ${this.id}: Doors closing.`);
            await this.close();

            if (this.requests.length === 0) {
                this.dir = Direction.IDLE;
                console.log(`Elevator ${this.id}: No remaining requests. Setting direction to IDLE.`);
            }
        }

        this.isMoving = false; // Mark as not moving to allow the next step
    }

    open() {
        return new Promise(resolve => {
            this.isOpen = true;
            console.log(`Elevator ${this.id}: Doors opened.`);
            resolve();
        });
    }

    close() {
        return new Promise(resolve => {
            this.isOpen = false;
            console.log(`Elevator ${this.id}: Doors closed.`);
            resolve();
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { Elevator, Direction };