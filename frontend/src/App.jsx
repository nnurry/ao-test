import React, { useState, useEffect } from 'react';
import './App.css';

const apiURL = "http://localhost:5000";

const App = () => {
    const numFloors = 10; // Adjusted for 10 floors
    const elevatorButtonOrders = [5, 10, 4, 9, 3, 8, 2, 7, 1, 6];
    const [elevatorStates, setElevatorStates] = useState([]);

    useEffect(() => {
        const fetchElevatorStatus = () => {
            fetch(`${apiURL}/elevator/status/all`)
                .then(res => res.json())
                .then(data => {
                    setElevatorStates(data.map(elevatorData => ({
                        id: elevatorData.id,
                        currentFloor: elevatorData.currentFloor,
                        direction: elevatorData.direction,
                        requests: elevatorData.requests,
                        isOpen: elevatorData.isOpen // Assuming API provides door status
                    })));
                });
        };

        const intervalId = setInterval(fetchElevatorStatus, 250);

        return () => clearInterval(intervalId);
    }, []);

    const callElevator = (floor, direction = null, elevatorId = null) => {
        fetch(`${apiURL}/elevator/call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elevatorId, floor, direction }),
        });
    };

    const openDoor = (floor, elevatorId) => {
        fetch(`${apiURL}/elevator/open`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elevatorId, floor }),
        })
            .then(res => res.json())
            .then(() => {
                setElevatorStates(prevStates =>
                    prevStates.map(state =>
                        state.id === elevatorId ? { ...state, isOpen: true } : state
                    )
                );
            });
    };

    const closeDoor = (floor, elevatorId) => {
        fetch(`${apiURL}/elevator/close`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elevatorId, floor }),
        })
            .then(res => res.json())
            .then(() => {
                setElevatorStates(prevStates =>
                    prevStates.map(state =>
                        state.id === elevatorId ? { ...state, isOpen: false } : state
                    )
                );
            });
    };

    const resetElevatorSystem = () => {
        fetch(`${apiURL}/elevator/reset`, { method: 'POST' });
    };

    const getElevatorStatusStr = (elevator) => {
        let symbol = "";
        if (elevator.direction === "up") {
            symbol = "⬆️";
        } else if (elevator.direction === "down") {
            symbol = "⬇️";
        }

        return elevator.currentFloor + " " + symbol;
    };

    const renderFloors = () => {
        const floors = [];
        for (let i = 1; i <= numFloors; i++) {
            const floorElevators = [];

            for (let j = 0; j < elevatorStates.length; j++) {
                const elevatorId = j;
                const elevator = elevatorStates[elevatorId];
                const isElevatorHere = elevator.currentFloor === i;

                floorElevators.push(
                    <div key={elevatorId} className={`elevator-container`}>
                        <div className={`elevator ${isElevatorHere ? "elevator-here" : ""} ${elevator.isOpen ? "door-open" : ""}`}>
                            {getElevatorStatusStr(elevator)}
                        </div>
                        <button className="call-button" onClick={() => callElevator(i, "up", null)}>⬆️</button>
                        <button className="call-button" onClick={() => callElevator(i, "down", null)}>⬇️</button>
                        <div className="call-buttons">
                            {
                                (
                                    <div className="floor-selection">
                                        {elevatorButtonOrders.map(floor => {
                                            return (
                                                <button
                                                    key={floor}
                                                    disabled={!isElevatorHere}
                                                    className="call-button"
                                                    onClick={() => callElevator(floor, null, elevatorId)}
                                                >
                                                    {floor}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            <button
                                className="call-button"
                                onClick={() => openDoor(i, elevatorId)}
                                disabled={elevator.isOpen || elevator.currentFloor !== i}>
                                ⬅️➡️
                            </button>
                            <button
                                className="call-button"
                                onClick={() => closeDoor(i, elevatorId)}
                                disabled={!elevator.isOpen || elevator.currentFloor !== i}>
                                ➡️⬅️
                            </button>
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
            <button className="reset-button" onClick={resetElevatorSystem}>Reset System</button>
            <div className="elevator-shaft">
                {renderFloors()}
            </div>
        </div>
    );
};

export default App;
