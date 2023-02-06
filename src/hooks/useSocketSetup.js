import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import socket from '../config/Socket';
import { authActions } from '../store/auth';
import { roomActions } from '../store/room';
import { chatActions } from '../store/chat';
import { notificationActions } from '../store/notification';
import { useToast } from '@chakra-ui/react';

let timer2;

const useSocketSetup = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.auth.user);
  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const notification = useSelector((state) => state.notification.notification);
  const messages = useSelector((state) => state.chat.messages);
  const chatroom = useSelector((state) => state.chat.chatroom);
  const chats = useSelector((state) => state.chat.chats);
  const toast = useToast();
  const selectedChatRef = useRef(selectedChat);
  const chatroomRef = useRef(chatroom);
  const userRef = useRef(user);
  const chatsRef = useRef(chats);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    chatroomRef.current = chatroom;
  }, [chatroom]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    // Main Connect -----------------------------------------------------------------------------------------------------------
    toast({
      title: 'Connecting...',
      status: 'info',
      duration: 1000,
      isClosable: true,
      position: 'top',
    });
    socket.connect();

    toast({
      title: 'Connected!',
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top',
    });
    socket.emit('go-online', userRef.current);

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

    // Chats -----------------------------------------------------------------------------------------------------------

    socket.once('deleteConversation', ({ chatId, userId, userName }) => {
      toast({
        title: userName + ' has deleted your conversation...',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      dispatch(chatActions.setConversationDeleted({ chatId, userId }));
    });

    socket.once('messageReceived', ({ newMessageReceived, chat }) => {
      // user ID is too hacky for this. should use room id

      const selectedChat = selectedChatRef.current;
      const chats = [...chatsRef.current];
      const senderId = newMessageReceived.sender._id;
      if (!selectedChat) {
        // remove all previous notifications from this user
        const not = notification.filter(
          (n) => n.sender._id !== newMessageReceived.sender._id,
        );

        // check if conversation exists, if not, add conversation
        let flag = false;

        for (let x = 0; x < chats.length; x++) {
          for (let y = 0; y < chats[x].users.length; y++) {
            if (chats[x].users[y]._id === senderId) {
              flag = true;
            }
          }
        }

        if (!flag) {
          // add chat
          dispatch(chatActions.setChats([chat, ...chats]));
          // dispatch(chatActions.setSelectedChat(chat));
        }

        // add notification
        dispatch(notificationActions.setNotification([newMessageReceived, ...not]));
        return;
      }

      const filter = chat.users.filter((c) => c._id !== user._id);
      const room = chat.users.find((c) => c._id !== user._id);
      // if other users id is equal to other users id in selected chat
      if (selectedChat._id === chat._id && senderId === room._id) {
        // render messages in chat
        const not = notification.filter(
          (n) => n.sender._id !== newMessageReceived.sender._id,
        );
        dispatch(notificationActions.setNotification([...not]));
        dispatch(chatActions.setMessages([...messages, newMessageReceived]));
      } else {
        if (filter.length < 2) {
          // remove all previous notifications from this user
          const not = notification.filter(
            (n) => n.sender._id !== newMessageReceived.sender._id,
          );
          // check if conversation exists, if not, add conversation

          // add notification
          dispatch(notificationActions.setNotification([newMessageReceived, ...not]));
        }
      }
    });

    socket.on('online', (userId) => {
      dispatch(chatActions.setUserOnline(userId));
    });

    socket.on('offline', (userId) => {
      dispatch(chatActions.setUserOffline(userId));
    });

    socket.on('typing', ({ userTyping }) => {
      dispatch(chatActions.setIsTyping(true));
      dispatch(chatActions.setUserTyping(userTyping));
      clearTimeout(timer2);
      timer2 = setTimeout(() => {
        dispatch(chatActions.setIsTyping(false));
        dispatch(chatActions.setUserTyping(null));
      }, 3000);
    });

    socket.on('stopTyping', () => {
      dispatch(chatActions.setIsTyping(false));
      dispatch(chatActions.setUserTyping(null));
    });

    // cleanup
    return () => {
      socket.off('connect_error');
      socket.removeAllListeners('typing');
      socket.removeAllListeners('stopTyping');
      socket.removeAllListeners('messageReceived');
      socket.removeAllListeners('deleteConversation');
      socket.removeAllListeners('offline');
      socket.removeAllListeners('online');
    };
  }, [user, dispatch, messages, notification, selectedChat, history, chatroom, toast]);
};

export default useSocketSetup;
