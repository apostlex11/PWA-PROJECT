// client/src/pages/home/index.js

import styles from './styles.module.css';
import { useNavigate } from 'react-router-dom';

const Home = ({ username, setUsername, room, setRoom, socket }) => {

    const navigate = useNavigate();

    const joinRoom = () => {
        if (room !== '' && username !== '') {
            socket.emit('join_room', { username, room });
        }
        navigate('/chat', { replace: true });
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1>{`<>DevRooms</>`}</h1>
                <input className={styles.input} 
                    placeholder='Username...' 
                    onChange={(e) => setUsername(e.target.value)} // Add this
                />

                <select className={styles.input}
                    onChange={(e) => setRoom(e.target.value)} 
                >
                    <option>-- Select Room --</option>
                    <option value='javascript'>Chess</option>
                    <option value='node'>Hang Man</option>
                    <option value='express'>Tic-Tac-Toe</option>
                    <option value='react'>Checkers</option>
                </select>

                <button className='btn btn-secondary' 
                    style={{ width: '100%' }}
                    onClick={joinRoom}
                >
                    Join Room
                </button>
            </div>
        </div>
    );
};

export default Home;