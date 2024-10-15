import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';


const socket = io(URL);

socket.connect();

export default socket;