const { ElevatorDirection: Direction, ElevatorState: State } = require("./enums");

class Elevator {
    constructor(id, numOfFloors, initialFloor = 1) {
        this.id = id;
        this.numOfFloors = numOfFloors;
        this.currentFloor = initialFloor;
        this.direction = Direction.IDLE;
        this.state = State.IDLE;
        this.isOpen = false;
        this.requests = {};
        this.requests[Direction.UP] = [];
        this.requests[Direction.DOWN] = [];
        this.abortController = new AbortController();
    }

    addRequest(floor, direction) {
        console.log(`Elevator ${this.id}: Added request to move to floor ${floor}`);
        if (this.requests[direction].includes(floor)) {
            console.log(`Elevator ${this.id}: Duplicated request to move to floor ${floor}`);
            return false;
        }
        if ((floor < 1 || floor > this.totalFloors)) {
            console.log(`Elevator ${this.id}: Invalid floor ${floor}`);
            return false;
        }
        this.requests[direction].push(floor);
        // Elevator going down => Sort the floor descendingly to pick up
        // From top down, otherwise ascendingly
        this.requests[direction].sort((prev, next) =>
            this.direction == Direction.DOWN
                ? (next - prev)
                : (prev - next)
        );
        return true;
    }

    moveOneFloor() {
        let isMoved = false;
        // move 1 floor at a time, direction = UP => increment floor
        if (this.direction == Direction.UP) {
            this.currentFloor++;
        } else if (this.direction == Direction.DOWN) {
            this.currentFloor--;
        }
        return isMoved;
    }

    async updateState(waitTime) {
        if (this.state == State.LOADING) {
            return;
        }
        if (this.requests[Direction.UP].length + this.requests[Direction.DOWN].length <= 0) {
            this.direction = Direction.IDLE;
            this.state = State.IDLE;
            return;
        }
        let direction = this.direction;
        if (this.state == State.IDLE || this.state == State.MOVING) {
            if (this.requests[Direction.UP].length > 0) {                console.log("UP", this.requests[Direction.UP])
                direction = Direction.UP;
            } else if (this.requests[Direction.DOWN].length > 0){
                direction = Direction.DOWN;
            }
        }
        this.direction = direction;
        if (direction == Direction.IDLE) {
            // nothing changed -> both empty
            return;
        }
        const nextFloor = this.requests[direction][0];
        if (nextFloor > this.currentFloor) {
            console.log(`Elevator ${this.id}: Moving up to ${this.currentFloor + 1}`);
            this.direction = Direction.UP;
            this.state = State.MOVING;
        } else if (nextFloor < this.currentFloor) {
            console.log(`Elevator ${this.id}: Moving down to ${this.currentFloor - 1}`);
            this.direction = Direction.DOWN;
            this.state = State.MOVING;
        } else {
            console.log(`Elevator ${this.id}: Arrived at ${nextFloor}`);
            this.requests[direction].shift();
            this.state = State.MOVING;
            await this.openDoor(waitTime).catch(e => console.log(`Elevator ${this.id}:`, e));
        }
    }

    async move(waitTime) {
        if (this.state == State.MOVING) {
            this.moveOneFloor();
        }
        await this.updateState(waitTime);
    }

    async openDoor(waitTime) {
        return new Promise((resolve, reject) => {
            console.log(`Elevator ${this.id}: Doors opening.`);
            const resolveTimeout = setTimeout(() => {
                this.state = State.IDLE;
                this.isOpen = false;
                resolve();
            }, waitTime);
            const { signal } = this.abortController;
            signal.addEventListener("abort", () => {
                clearTimeout(resolveTimeout);
                reject("Forced to close the door.");
            });
            this.state = State.LOADING;
            this.isOpen = true;
            console.log(`Elevator ${this.id}: Doors opened.`);
        });
    }

    async closeDoor() {
        return new Promise(resolve => {
            console.log(`Elevator ${this.id}: Doors closing.`);
            this.state = State.IDLE;
            this.isOpen = false;
            this.abortController.abort();
            console.log(`Elevator ${this.id}: Doors closed.`);
            this.abortController = new AbortController();
            resolve();
        });
    }

    getStatus() {
        return {
            id: this.id,
            currentFloor: this.currentFloor,
            direction: this.direction,
            state: this.state,
            isMoving: this.state == State.MOVING,
            isOpen: this.isOpen,
            requests: this.requests,
        }
    }
}

module.exports = {
    Elevator,
};
