import React, { useState, useEffect } from 'react';
import './App.css';

const apiURL = "http://localhost:5000";

const App = () => {
    const numFloors = 10; // Adjusted for 10 floors
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

    // const getFloorElevatorKey = (elevatorId, floor) => `${elevatorId}_${floor}`;

    // const checkFloorElevatorKey = (floorElevatorKey) => (
    //     requestedFloor?.[floorElevatorKey]
    // );

    const callElevator = (elevatorId, floor, direction) => {
        // const key = getFloorElevatorKey(elevatorId, floor);
        // requestedFloor[key] = true;
        // setRequestedFloor(requestedFloor);
        fetch(`${apiURL}/elevator/call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ elevatorId, floor, direction }),
        })
    };

    const openDoor = (elevatorId, floor) => {
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

    const closeDoor = (elevatorId, floor) => {
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

    const getElevatorStatusStr = (elevator) => {
        let symbol = "";
        if (elevator.direction === "up") {
            symbol = "⬆️";
        } else if (elevator.direction === "down") {
            symbol = "⬇️";
        }

        return elevator.currentFloor + " " + symbol;
    }

    const renderFloors = () => {
        const floors = [];
        for (let i = 1; i <= numFloors; i++) {
            const floorElevators = [];

            for (let j = 0; j < elevatorStates.length; j++) {
                const elevator = elevatorStates[j];
                const isElevatorHere = elevator.currentFloor === i;

                floorElevators.push(
                    <div key={j} className={
                        `elevator-container`}
                    >
                        <div className={`elevator ${isElevatorHere ? 'elevator-here' : ''} ${elevator.isOpen ? 'door-open' : ''}`}>
                            {getElevatorStatusStr(elevator)}
                        </div>
                        <div className="call-buttons">
                            <button className="call-button" onClick={() => callElevator(elevator.id, i, "up")}>⬆️</button>
                            <button className="call-button" onClick={() => callElevator(elevator.id, i, "down")}>⬇️</button>
                            <button
                                className="call-button"
                                onClick={() => openDoor(elevator.id, i)}
                                disabled={elevator.isOpen || elevator.currentFloor !== i}>
                                ⬅️➡️
                            </button>
                            <button
                                className="call-button"
                                onClick={() => closeDoor(elevator.id, i)}
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
            <div className="elevator-shaft">
                {renderFloors()}
            </div>
        </div>
    );
};

export default App;
