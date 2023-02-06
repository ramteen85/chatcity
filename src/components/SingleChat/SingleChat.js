import { useDispatch, useSelector } from 'react-redux';
import { ArrowBackIcon, DeleteIcon } from '@chakra-ui/icons';
import { Box, Text } from '@chakra-ui/layout';
import {
  FormControl,
  IconButton,
  Input,
  Spinner,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { getSender, getSenderFull } from '../../config/ChatLogics';
import ProfileModal from '../ProfileModal/ProfileModal';
import classes from './SingleChat.module.scss';
import ScrollableChat from '../ScrollableChat/ScrollableChat';
import Typing from '../Typing/Typing';
import { notificationActions } from '../../store/notification';
import { chatActions } from '../../store/chat';
import socket from '../../config/Socket';
import OnlineStatus from './OnlineStatus/OnlineStatus';
import ConfirmDialogModal from '../ConfirmDialogModal/ConfirmDialogModal';

// file structure pattern
// https://andela.com/insights/structuring-your-react-application-atomic-design-principles/

let timer;

const SingleChat = () => {
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const messages = useSelector((state) => state.chat.messages);
  const isTyping = useSelector((state) => state.chat.isTyping);
  const userTyping = useSelector((state) => state.chat.userTyping);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.notification.loading);
  const bottomRef = useRef();
  const topRef = useRef();
  const toast = useToast();

  useEffect(() => {
    fetchMessages();
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?._id]);

  const userScrolling = (e) => {
    if (e.target.scrollTop === 0) {
      setPage(page + 1);
      fetchMessages();
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 800);
    }
  };

  const fetchMessages = async () => {
    try {
      if (!selectedChat) return;

      dispatch(notificationActions.startLoading());

      let response = await fetch(
        `/api/message/?chatId=${selectedChat._id}&page=${page}`,
        {
          method: 'get',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      response = await response.json();

      dispatch(chatActions.setMessages(response));
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
  };

  const deleteConversation = async (onClose) => {
    try {
      const chatId = selectedChat._id;

      let response = await fetch(`/api/chat/delete`, {
        method: 'post',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
        }),
      });

      response = await response.json();

      if (response.message !== 'Conversation deleted!') {
        throw Error(response.message);
      }

      socket.emit('deleteConversation', {
        chatId: chatId,
        userId: user._id,
        userName: user.name,
        receiver: getSenderFull(user, selectedChat.users),
      });

      // toast message
      toast({
        title: 'Success',
        description: response.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });

      // clean up
      dispatch(chatActions.setSelectedChat(null));
      onClose();
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error Occurred',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      onClose();
    }
  };

  const sendMessage = async (e) => {
    if (e.key === 'Enter' && newMessage) {
      try {
        const room = selectedChat.users.find((u) => u._id !== user._id);

        socket.emit('stopTyping', room._id);
        let response = await fetch(`/api/message`, {
          method: 'post',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newMessage,
            chatId: selectedChat._id,
          }),
        });

        response = await response.json();

        // needs error handling

        setNewMessage('');
        socket.emit('newMessage', {
          newMessageReceived: response,
        });
        dispatch(chatActions.setMessages([...messages, response]));
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } catch (error) {
        toast({
          title: 'Error Occurred',
          description: 'Failed to send message. Try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
    }
  };

  useEffect(() => {
    if (isTyping) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isTyping]);

  const typingHandler = (e) => {
    try {
      setNewMessage(e.target.value);

      dispatch(chatActions.setTyping(true));
      socket.emit('typing', { user: user, selectedChat: selectedChat });
      let timerLength = 2000;
      clearTimeout(timer);
      timer = setTimeout(() => {
        socket.emit('stopTyping', selectedChat._id);
        dispatch(chatActions.setTyping(false));
      }, timerLength);
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

  return (
    <>
      {selectedChat ? (
        <>
          <Box
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            width="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: 'space-between' }}
            alignItems="center"
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => dispatch(chatActions.setSelectedChat(''))}
            />
            <OnlineStatus />
            {getSender(user, selectedChat.users)}
            <Box display="flex">
              <ProfileModal user={getSenderFull(user, selectedChat.users)} />

              <ConfirmDialogModal
                message="Delete Conversation?"
                yesOperation={deleteConversation}
              >
                <Tooltip
                  label={'Delete Conversation...'}
                  placement="bottom-start"
                  hasArrow
                >
                  <IconButton
                    display={{ base: 'flex' }}
                    icon={<DeleteIcon />}
                    style={{ marginLeft: '10px' }}
                    // onClick={deleteConversation}
                  />
                </Tooltip>
              </ConfirmDialogModal>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            padding={3}
            background="#E8E8E8"
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                width={20}
                height={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div onScroll={userScrolling} className={`${classes['messages']}`}>
                <span style={{ marginTop: '1rem' }} ref={topRef}></span>
                <ScrollableChat />
                {isTyping &&
                userTyping.user._id !== user._id &&
                userTyping.chat._id === selectedChat._id ? (
                  <Typing sender={userTyping.user} />
                ) : (
                  <></>
                )}
                <span ref={bottomRef}></span>
              </div>
            )}

            {(selectedChat?.deleted?.length === 0 &&
              selectedChat?.deleted[0] !== user._id &&
              selectedChat?.deleted[1] !== user._id) ||
            !selectedChat?.deleted ? (
              <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                <Input
                  variant="filled"
                  bg="#e0e0e0"
                  placeholder="Send a message..."
                  autoComplete="off"
                  onChange={typingHandler}
                  value={newMessage}
                />
              </FormControl>
            ) : (
              <Box textAlign="center">User has deleted the conversation...</Box>
            )}
          </Box>
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Select or start a conversation to begin chatting...
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
