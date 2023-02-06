import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedChat: null,
  chats: [],
  loading: false,
  messages: [],
  isTyping: false,
  userTyping: null,
  typing: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: initialState,
  reducers: {
    logoutHandler(state, action) {
      state.selectedChat = null;
      state.chats = [];
      state.loading = false;
      state.messages = [];
      state.isTyping = false;
      state.userTyping = false;
      state.typing = false;
    },
    setSelectedChat(state, action) {
      state.selectedChat = action.payload;
    },
    setChats(state, action) {
      state.chats = action.payload;
    },
    startLoading(state) {
      state.loading = true;
    },
    stopLoading(state) {
      state.loading = false;
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    setIsTyping(state, action) {
      state.isTyping = action.payload;
    },
    setUserTyping(state, action) {
      state.userTyping = action.payload;
    },
    setTyping(state, action) {
      state.typing = action.payload;
    },
    setConversationDeleted(state, action) {
      for (let x = 0; x < state.chats.length; x++) {
        if (state.chats[x]._id === action.payload.chatId) {
          state.chats[x].deleted = state.chats[x].deleted.filter(
            (u) => u !== action.payload.userId,
          );
          state.chats[x].deleted.push(action.payload.userId);
          if (state.selectedChat._id === state.chats[x]._id) {
            state.selectedChat.deleted.push(action.payload.userId);
          }
          break;
        }
      }
    },
    setUserOnline(state, action) {
      for (let x = 0; x < state.chats.length; x++) {
        for (let y = 0; y < state.chats[x].users.length; y++) {
          if (state.chats[x].users[y]._id === action.payload) {
            state.chats[x].users[y].online = true;
          }
        }
      }
      if (state.selectedChat) {
        for (let x = 0; x < state.selectedChat.users.length; x++) {
          if (state.selectedChat.users[x]._id === action.payload) {
            state.selectedChat.users[x].online = true;
            break;
          }
        }
      }
    },
    setUserOffline(state, action) {
      for (let x = 0; x < state.chats.length; x++) {
        for (let y = 0; y < state.chats[x].users.length; y++) {
          if (state.chats[x].users[y]._id === action.payload) {
            state.chats[x].users[y].online = false;
          }
        }
      }
      if (state.selectedChat) {
        for (let x = 0; x < state.selectedChat.users.length; x++) {
          if (state.selectedChat.users[x]._id === action.payload) {
            state.selectedChat.users[x].online = false;
            break;
          }
        }
      }
    },
  },
});

export const chatActions = chatSlice.actions;

export default chatSlice.reducer;
