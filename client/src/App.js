import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FormContainer from "./components/form/FormContainer";
import NavigationBar from "./components/lobby/Navigation";
import TTT from './components/tictactoe/TicTacToe'; 
import Chat from './pages/chat'
import Home from './pages/home';
import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:4000');

export default function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<FormContainer />} />
        <Route path='/chat' element={<Home 
        setUsername={setUsername}
        room={room}
        setRoom={setRoom}
        socket={socket}
        />} />
        <Route path='/chatroom' element={<Chat
         username={username}
         room={room}
         socket={socket}
        />} />
        <Route path="/tictactoe" element={<TTT />} />
      </Routes>
    </Router>
  );
}