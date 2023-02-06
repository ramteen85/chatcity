import { createSlice } from '@reduxjs/toolkit';
import { chatActions } from './chat';
import { notificationActions } from './notification';
import { roomActions } from './room';

let logoutTimer;

const initialState = {
  user: JSON.parse(localStorage.getItem('userInfo')) || null,
};

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const deadline = new Date(expirationTime).getTime();

  return deadline - currentTime;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setExpirationDate(state, action) {
      localStorage.setItem('expiresIn', action.payload);
    },
    updatePic(state, action) {
      state.user.pic = action.payload.pic;
      state.user.pic_secure = action.payload.pic_secure;
    },
    updateName(state, action) {
      state.user.name = action.payload;
    },
    loginHandler(state, action) {
      state.user = action.payload;
      localStorage.setItem(
        'expiresIn',
        new Date(new Date().getTime() + action.payload.expiresIn),
      );
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logoutHandler(state, action) {
      state.user = null;
      state.expirationTime = null;
      localStorage.removeItem('userInfo');
      localStorage.removeItem('roomCreds');
      localStorage.removeItem('expiresIn');
      if (logoutTimer) clearInterval(logoutTimer);
    },
  },
});

export const authActions = authSlice.actions;

// start up autologout timer
export const setAuthTimer = () => {
  return async (dispatch) => {
    try {
      // set up login and start timer
      const expirationTime = localStorage.getItem('expiresIn');
      let remainingTime = calculateRemainingTime(expirationTime);

      // update remaining time every second
      if (expirationTime) {
        logoutTimer = setInterval(async () => {
          remainingTime = remainingTime - 1;
          let expirationTime = new Date(new Date().getTime() + remainingTime);
          await dispatch(authActions.setExpirationDate(expirationTime.toISOString()));
          if (remainingTime < 0) {
            await dispatch(authActions.logoutHandler());
            await dispatch(chatActions.logoutHandler());
            await dispatch(notificationActions.logoutHandler());
            await dispatch(roomActions.logoutHandler());
            clearInterval(logoutTimer);
          }
        }, 1000);
      } else {
        await dispatch(authActions.logoutHandler());
        await dispatch(chatActions.logoutHandler());
        await dispatch(notificationActions.logoutHandler());
        await dispatch(roomActions.logoutHandler());
        clearInterval(logoutTimer);
      }
    } catch (error) {
      console.log(error);
    }
  };
};

export default authSlice.reducer;
