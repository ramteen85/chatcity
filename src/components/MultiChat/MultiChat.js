import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@chakra-ui/layout';
import { FormControl, Input, Spinner, useToast } from '@chakra-ui/react';
import classes from '../SingleChat/SingleChat.module.scss';
import socket from '../../config/Socket';
import { roomActions } from '../../store/room';
import { notificationActions } from '../../store/notification';
import ChatroomMessages from '../ChatroomMessages/ChatroomMessages';

const MultiChat = () => {
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState('');
  const [scrolling, setScrolling] = useState(false);
  const [page, setPage] = useState(1);
  const chatroom = useSelector((state) => state.room.chatroom);
  const messages = useSelector((state) => state.room.messages);
  const loading = useSelector((state) => state.notification.loading);
  const user = useSelector((state) => state.auth.user);
  const topRef = useRef();
  const bottomRef = useRef();

  const toast = useToast();

  const userScrolling = async (e) => {
    try {
      if (e.target.scrollTop === 0) {
        setPage(page + 1);
        let response = await fetch(`/api/message/room/?id=${chatroom._id}&page=${page}`, {
          method: 'get',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        response = await response.json();
        dispatch(roomActions.setMessages(response));
        setTimeout(() => {
          topRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 400);
      }
    } catch (error) {
      toast({
        title: 'Error Occurred',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      dispatch(notificationActions.startLoading());

      let response = await fetch(`/api/message/room/?id=${chatroom._id}&page=${page}`, {
        method: 'get',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      response = await response.json();
      dispatch(roomActions.setMessages(response));
      dispatch(notificationActions.stopLoading());
    } catch (error) {
      toast({
        title: 'Error Occurred',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [chatroom, dispatch, toast, user, page]);

  useEffect(() => {
    if (scrolling) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
    setScrolling(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    dispatch(notificationActions.startLoading());
    let creds = JSON.parse(localStorage.getItem('roomCreds'));
    if (creds) {
      dispatch(notificationActions.stopLoading());
    }
  }, [dispatch]);

  useEffect(() => {
    if (chatroom && chatroom._id) {
      fetchMessages();
    }
  }, [chatroom, fetchMessages]);

  const sendMessage = async (e) => {
    if (e.key === 'Enter' && newMessage) {
      try {
        let response = await fetch(`/api/message/room`, {
          method: 'post',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newMessage,
            roomId: chatroom._id,
          }),
        });
        response = await response.json();
        setNewMessage('');
        socket.emit('roomMessage', { message: response });
        dispatch(roomActions.setMessages([...messages, response]));
      } catch (error) {
        toast({
          title: 'Error Occurred',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    }
  };

  return (
    <>
      <Box
        display="flex"
        flexDir="column"
        justifyContent="flex-end"
        padding={3}
        background="#E8E8E8"
        width="100%"
        height={{ base: '90%', md: '100%' }}
        borderRadius="lg"
        overflowY="hidden"
      >
        {loading ? (
          <Spinner size="xl" width={20} height={20} alignSelf="center" margin="auto" />
        ) : (
          <div className={`${classes['messages']}`} onScroll={userScrolling}>
            <span style={{ marginTop: '1rem' }} ref={topRef}></span>
            <ChatroomMessages />
            <span></span>
            <span style={{ marginBottom: '1rem' }} ref={bottomRef}></span>
          </div>
        )}

        <FormControl onKeyDown={sendMessage} isRequired mt={3}>
          <Input
            variant="filled"
            bg="#e0e0e0"
            placeholder="Send a message..."
            onChange={(e) => setNewMessage(e.target.value)}
            value={newMessage}
          />
        </FormControl>
      </Box>
    </>
  );
};

export default MultiChat;
