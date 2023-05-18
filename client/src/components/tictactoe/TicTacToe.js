import { useEffect, useState } from "react";
import io from "socket.io-client";
import Header from "./Header";
import Board from "./Board";
import Footer from "./Footer";
import JoinRoom from './JoinRoom';
import NavigationBar from "../lobby/Navigation";

const socket = io.connect("http://localhost:3000");

export function Navigation() {
  return <NavigationBar />;
}

export default function TTT() {
  const [roomCode, setRoomCode] = useState(null);
  const [showJoinRoom, setShowJoinRoom] = useState(true);

  useEffect(() => {
    console.log(roomCode);
    if (roomCode) {
      socket.emit("joinRoom", roomCode);
      setShowJoinRoom(false);
    }
  }, [roomCode]);

  socket.on('connection error', (err) => {
    console.log('connection error')
  });

  return (
    <div>
      {showJoinRoom && <JoinRoom setRoomCode={setRoomCode} />}
      <Header />
      <Board socket={socket} roomCode={roomCode} setShowJoinRoom={setShowJoinRoom}/>
      <Footer />
    </div>
  );
}
