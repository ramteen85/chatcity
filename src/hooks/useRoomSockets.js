import { useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import socket from '../config/Socket';
import { authActions } from '../store/auth';
import { roomActions } from '../store/room';
import { useToast } from '@chakra-ui/react';

const useRoomSockets = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.auth.user);
  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const notification = useSelector((state) => state.notification.notification);
  const messages = useSelector((state) => state.room.messages);
  const chatroom = useSelector((state) => state.room.chatroom);
  const toast = useToast();
  const selectedChatRef = useRef(selectedChat);
  const chatroomRef = useRef(chatroom);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    chatroomRef.current = chatroom;
  }, [chatroom]);

  const goOnline = useCallback(async () => {
    // Main Connect -----------------------------------------------------------------------------------------------------------
    toast({
      title: 'Connecting...',
      status: 'info',
      duration: 1000,
      isClosable: true,
      position: 'top',
    });
    if (!socket.connected) socket.connect();
    setTimeout(() => {
      if (socket.connected) {
        toast({
          title: 'Connected!',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top',
        });
        socket.emit('go-online', userRef.current);
      }
    }, 2000);
  }, [toast]);

  useEffect(() => {
    goOnline();
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    // listeners
    socket.on('connect_error', () => {
      localStorage.removeItem('userInfo');
      dispatch(authActions.setUser(null));
      localStorage.removeItem('roomCreds');
      dispatch(roomActions.setRoom(null));
      toast({
        title: 'Disconnected',
        description: 'Please log in again...',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      history.push('/');
    });

    // Rooms -----------------------------------------------------------------------------------------------------------

    socket.once('newUser', ({ user }) => {
      // add user to participants

      console.log('new user');

      dispatch(roomActions.addParticipant(user));
      toast({
        title: user.name + ' has joined the chat...',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    });

    socket.once('exitUser', (oldUser) => {
      // remove user from participants

      dispatch(roomActions.removeParticipant(oldUser));
      toast({
        title: oldUser.name + ' has left the chat...',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    });

    socket.on('gotmsg', (data) => {
      dispatch(roomActions.setMessages([...messages, data.msg]));
    });

    // cleanup
    return () => {
      socket.off('connect_error');
      socket.removeAllListeners('newUser');
      socket.removeAllListeners('exitUser');
      socket.removeAllListeners('gotmsg');
      socket.removeAllListeners('disconnect');
    };
  }, [user, dispatch, messages, notification, selectedChat, history, chatroom, toast]);
};

export default useRoomSockets;
