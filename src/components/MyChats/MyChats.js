import { useToast } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Stack, Text } from '@chakra-ui/layout';
import React, { useEffect } from 'react';
import ChatLoading from '../ChatLoading/ChatLoading';
import { chatActions } from '../../store/chat';
import { getSender } from '../../config/ChatLogics';
import socket from '../../config/Socket';

const MyChats = () => {
  const dispatch = useDispatch();
  const fetchAgain = useSelector((state) => state.notification.fetchAgain);
  const user = useSelector((state) => state.auth.user);
  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const chats = useSelector((state) => state.chat.chats);
  const toast = useToast();

  const fetchChats = async () => {
    try {
      let response = await fetch(`/api/chat`, {
        method: 'get',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      response = await response.json();
      dispatch(chatActions.setChats(response));
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

  const selectChat = (chat) => {
    try {
      dispatch(chatActions.setSelectedChat(chat));
      socket.emit('joinChat', chat._id);
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

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir="column"
      alignItems="center"
      padding={3}
      bg="white"
      width={{ base: '100%', md: '31%' }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: '28px', md: '30px' }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Messages
      </Box>

      <Box
        display="flex"
        flexDir="column"
        padding={3}
        bg="#F8F8F8"
        width="100%"
        height="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => selectChat(chat)}
                cursor="pointer"
                bg={selectedChat && selectedChat._id === chat._id ? '#38B2AC' : '#E8E8E8'}
                color={selectedChat && selectedChat._id === chat._id ? 'white' : 'black'}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>{getSender(user, chat.users)}</Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
