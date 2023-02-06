import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notification: [],
  loading: false,
  fetchAgain: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState: initialState,
  reducers: {
    logoutHandler(state, action) {
      state.notification = [];
      state.loading = false;
      state.fetchAgain = false;
    },
    setNotification(state, action) {
      state.notification = action.payload;
    },
    toggleLoading(state) {
      state.loading = !state.loading;
    },
    startLoading(state) {
      state.loading = true;
    },
    stopLoading(state) {
      state.loading = false;
    },
    setFetchAgain(state, action) {
      state.fetchAgain = action.payload;
    },
  },
});

export const notificationActions = notificationSlice.actions;

export default notificationSlice.reducer;
