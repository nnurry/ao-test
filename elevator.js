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

    cost(seg1, seg2, seg3, upFirst = true) {
        let moveCost = 0;
        if (upFirst) {
            // move to top
            hi = seg1[seg1.length - 1]
            moveCost += (hi - this.curr) * this.moveTime;
            // move to bottom
            lo = seg2[seg2.length - 1];
            moveCost += (hi - lo) * this.moveTime;
            // move to immediates
            mid = seg3[seg3.length - 1];
            moveCost += (mid - lo) * this.moveTime;
        } else {
            // move to bottom
            lo = seg1[seg1.length - 1];
            moveCost += (this.curr - lo) * this.moveTime;
            // move to top
            hi = seg2[seg2.length - 1];
            moveCost += (hi - lo) * this.moveTime;
            // move to immediates
            mid = seg3[seg3.length - 1];
            moveCost += (mid - lo) * this.moveTime;
        }
        waitCost = (seg1.length + seg2.length + seg3.length) * this.waitTime;
        return moveCost + waitCost;
    }

    call(floor, dir) {
        function up(ups, downs) {
            // sort the up requests
            // move requests of lower floors to the end of the list
            let endOfSmallers = 0;
            for (const i = 0; i < ups.length; i++) {
                if (ups[i] >= this.curr) {
                    break;
                }
                endOfSmallers = i;
            }
            if (endOfSmallers > 0) {
                return [ups.slice(endOfSmallers), downs, ups.slice(0, endOfSmallers)];
            }
            return [ups, downs, []];
        }
        function down(ups, downs) {
            // sort the down requests
            // move requests of higher floors to the end of the list
            let endOfBiggers = 0;
            for (const i = 0; i < downs.length; i++) {
                if (downs[i] <= this.curr) {
                    break;
                }
                endOfBiggers = i;
            }
            if (endOfBiggers > 0) {
                return [downs.slice(endOfBiggers), ups, downs.slice(0, endOfBiggers)];
            }
            return [downs, ups, []];
        }
        const isDuplicated = this.requests.find((req) =>
            req.floor === floor
            && req.direction === dir
        );

        if (!isDuplicated) {
            this.requests.push({ floor, dir });

            let upRequests = this.requests.filter(req => req.dir === Direction.UP).sort((a, b) => a.floor < b.floor);
            let downRequests = this.requests.filter(req => req.dir === Direction.DOWN).sort((a, b) => a.floor > b.floor);

            if (this.dir === Direction.UP) {
                // sort the up requests
                // move requests of lower floors to the end of the list
                const segmentedMoves = this.up(upRequests, downRequests);
                this.requests = segmentedMoves.flat();
            }
            else if (this.dir === Direction.DOWN) {
                // sort the down requests
                // move requests of higher floors to the end of the list
                const segmentedMoves = this.down(upRequests, downRequests);
                this.requests = segmentedMoves.flat();
            }
            else {
                // find optimal trip (down first or up first)
                const segmentedUpMoves = this.up(upRequests, downRequests);
                const segmentedDownMoves = this.down(upRequests, downRequests);
                let chooseUp = this.cost(...segmentedUpMoves, true) < this.cost(...segmentedDownMoves, false);
                this.requests = chooseUp ? segmentedUpMoves.flat() : segmentedDownMoves.flat();
            }
        }
    }

    move() {
        // TODO
    }

    open() {
        this.isOpen = true;
    }

    close() {
        this.isOpen = false;
    }
}

module.exports = Elevator;