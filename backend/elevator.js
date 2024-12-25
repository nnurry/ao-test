const Direction = {
    "UP": "up",
    "DOWN": "down",
    "IDLE": "idle",
};

class Elevator {
    constructor(id, floors, waitTime = 6000, moveTime = 500) {
        this.id = id;
        this.curr = 1;
        this.dir = Direction.IDLE;
        this.requests = [];
        this.floors = floors;
        this.isOpen = false;
        this.isMoving = false;
        this.waitTime = waitTime;
        this.moveTime = moveTime;
        this.abortController = new AbortController();
    }

    reset() {
        this.curr = 1;
        this.dir = Direction.IDLE;
        this.requests = [];
        this.isOpen = false;
        this.isMoving = false;
        this.abortController = new AbortController(); 
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
            // Remove all requests for the current floor
            this.requests = this.requests.filter(req => req.floor !== this.curr);
            
            await this.open().catch(e => console.log(`Elevator ${this.id}:`, e));
            await this.close();
            
            if (this.requests.length === 0) {
                this.dir = Direction.IDLE;
                console.log(`Elevator ${this.id}: No remaining requests. Setting direction to IDLE.`);
            }
        }

        this.isMoving = false; // Mark as not moving to allow the next step
    }

    async open() {
        return new Promise((resolve, reject) => {
            console.log(`Elevator ${this.id}: Doors opening.`);
            const resolveTimeout = setTimeout(() => {
                resolve();
            }, this.waitTime);
            const { signal } = this.abortController;
            signal.addEventListener("abort", () => {
                clearTimeout(resolveTimeout);
                reject("Forced to close the door.");
            });
            this.isOpen = true;
            console.log(`Elevator ${this.id}: Doors opened.`);
        });
    }
    
    async close() {
        return new Promise(resolve => {
            console.log(`Elevator ${this.id}: Doors closing.`);
            this.isOpen = false;
            this.abortController.abort();
            console.log(`Elevator ${this.id}: Doors closed.`);
            this.abortController = new AbortController();
            resolve();
        });
    }
}

module.exports = { Elevator, Direction };
