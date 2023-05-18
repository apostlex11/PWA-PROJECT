import "./joinroom.css";
import { useState } from "react";


const JoinRoom = ({ setRoomCode }) => {
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [roomCodeSaved, setRoomCodeSaved] = useState(false);

    const handleSave = () => {
        if (roomCodeInput.trim().length > 0) {
            setRoomCode(roomCodeInput);
            setRoomCodeSaved(true);
        }
    };


    return (
        <>
            {!roomCodeSaved && (
                <div className="joinRoom-container">
                    <div className="joinRoom-card" >
                        <h1 className="joinRoom-card-title">Enter a room code</h1>
                        <input
                            className="joinRoom-card-input"
                            type="text"
                            placeholder="#"
                            onChange={(e) => setRoomCodeInput(e.target.value)}
                        />
                        <button onClick={handleSave} className="joinRoom-card-button">
                            Save
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default JoinRoom;