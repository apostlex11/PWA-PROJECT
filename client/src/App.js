// client/src/App.js
import './App.css';
import { useState } from 'react'; // Add this
import Home from './pages/home';
import Chat from './pages/chat';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client'; // Add this
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// integrating GraphQL ApolloClient
// Construct our main GraphQL API endpoint
const httpLink = createHttpLink({
  uri: '/graphql',
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('id_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  // Set up our client to execute the `authLink` middleware prior to making the request to our GraphQL API
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const socket = io.connect('http://localhost:4000'); // Add this -- our server will run on port 4000, so we connect to it from here

function App() {
  const [username, setUsername] = useState(''); // Add this
  const [room, setRoom] = useState(''); // Add this

  return (
    <ApolloProvider client={client}>
      <Router>
        <div className='App'>
          <Routes>
            <Route
              path='/'
              element={
                <Home
                  username={username} // Add this
                  setUsername={setUsername} // Add this
                  room={room} // Add this
                  setRoom={setRoom} // Add this
                  socket={socket} // Add this
                />
              }
            />
            <Route
              path='/chat'
              element={<Chat username={username} room={room} socket={socket} />}
            />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;