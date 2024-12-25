import React, { useState, useEffect } from 'react';
import './App.css';

const apiURL = "http://localhost:5000";

const App = () => {
    const numFloors = 10; // Adjusted for 10 floors
    const numElevators = 3;
    const [elevatorStates, setElevatorStates] = useState(
        Array(numElevators).fill({ currentFloor: 1, direction: "idle", requests: [] })
    );

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetch(`${apiURL}/elevator/status/all`)
                .then(res => res.json())
                .then(data => {
                    setElevatorStates(data.map(elevatorData => ({
                        currentFloor: elevatorData.currentFloor,
                        direction: elevatorData.direction,
                        requests: elevatorData.requests
                    })));
                });
        }, 250);

        return () => clearInterval(intervalId);
    }, []);

    const callElevator = (elevatorId, floor, direction) => {
        fetch(`${apiURL}/elevator/call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elevatorId, floor, direction }),
        })
            .then(res => res.json())
            .then(data => {
                setElevatorStates(prevStates => {
                    const newStates = [...prevStates];
                    newStates[parseInt(elevatorId) - 1] = {
                        currentFloor: data.elevatorState.curr,
                        direction: data.elevatorState.dir,
                        requests: data.elevatorState.requests
                    };
                    return newStates;
                });
            });
    };

    const renderFloors = () => {
        const floors = [];
        for (let i = 1; i <= numFloors; i++) {
            const floorElevators = [];

            for (let j = 0; j < numElevators; j++) {
                const isElevatorHere = elevatorStates[j].currentFloor === i;
                const upRequestsOnFloor = elevatorStates[j].requests.filter(req => req.floor === i && req.dir === "up");
                const downRequestsOnFloor = elevatorStates[j].requests.filter(req => req.floor === i && req.dir === "down");

                floorElevators.push(
                    <div key={j} className="elevator-container">
                        <div className={`elevator ${isElevatorHere ? 'elevator-here' : ''}`}></div>
                        <div className="call-buttons">
                            <button onClick={() => callElevator(j + 1, i, "up")}
                                disabled={elevatorStates[j].direction === "down" && elevatorStates[j].currentFloor !== i}
                                className={`call-button ${upRequestsOnFloor.length > 0 ? 'active-call-up' : ''}`}>▲</button>
                            <button onClick={() => callElevator(j + 1, i, "down")}
                                disabled={elevatorStates[j].direction === "up" && elevatorStates[j].currentFloor !== i}
                                className={`call-button ${downRequestsOnFloor.length > 0 ? 'active-call-down' : ''}`}>▼</button>
                        </div>
                    </div>
                );
            }

            floors.push(
                <div key={i} className="floor">
                    <div className="floor-number">{i}</div>
                    <div className="elevators-on-floor">{floorElevators}</div>
                </div>
            );
        }
        return floors;
    };

    return (
        <div className="container">
            <h1>Elevator Simulator</h1>
            <div className="elevator-shaft">
                {renderFloors()}
            </div>
        </div>
    );
};

export default App;