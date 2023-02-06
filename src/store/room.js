import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chatroom: localStorage.getItem('roomCreds') || null,
  messages: [],
  passReady: false,
};

const roomSlice = createSlice({
  name: 'room',
  initialState: initialState,
  reducers: {
    logoutHandler(state, action) {
      state.chatroom = null;
      state.messages = [];
      state.passReady = false;
    },
    setRoom(state, action) {
      state.chatroom = action.payload;
    },
    addParticipant(state, action) {
      if (state.chatroom && state.chatroom.users) {
        const filter = state.chatroom.users.filter((u) => u._id === action.payload._id);
        if (filter.length === 0) {
          state.chatroom.users = [...state.chatroom.users, action.payload];
        }
      }
    },
    removeParticipant(state, action) {
      if (state.chatroom && state.chatroom.users) {
        const filter = state.chatroom.users.filter((u) => u._id !== action.payload._id);
        state.chatroom.users = filter;
      }
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    setPassReady(state, action) {
      state.passReady = action.payload;
    },
  },
});

export const roomActions = roomSlice.actions;

export default roomSlice.reducer;
