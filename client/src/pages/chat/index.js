// client/src/pages/chat/index.js

import styles from './styles.module.css';
import MessagesReceived from './messages';
import SendMessage from './send-message';
import RoomAndUsersColumn from './room-and-users';
// import Chess from "chess.js";
import { Chessboard } from "react-chessboard";

const Chat = ({ socket, username, room }) => {
    return (
        <div>
            <div className={styles.chatContainer}>
                <RoomAndUsersColumn socket={socket} username={username} room={room} />
                <div className={styles.chessContainer}>
                    <Chessboard id="BasicBoard" />
                </div>
                <div className={styles.rauc}>
                    <MessagesReceived socket={socket} username={username} />
                    <SendMessage socket={socket} username={username} room={room} />
                </div>
            </div>
        </div>
    );
};

export default Chat;