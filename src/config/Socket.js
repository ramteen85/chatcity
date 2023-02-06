import { io } from 'socket.io-client';
const ENDPOINT = 'ws://localhost:8000';

const socket = io(ENDPOINT, {
  autoConnect: false,
  // withCredentials: true,
});

export default socket;
