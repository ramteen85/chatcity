import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth'; // authentication and users
import chatReducer from './chat'; // conversations
import roomReducer from './room'; // chatrooms
import notificationReducer from './notification'; // chatrooms

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    room: roomReducer,
    notification: notificationReducer,
  },
});

export default store;
