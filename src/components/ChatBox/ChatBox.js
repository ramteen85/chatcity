import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@chakra-ui/layout';
import SingleChat from '../SingleChat/SingleChat';

const ChatBox = () => {
  const selectedChat = useSelector((state) => state.chat.selectedChat);

  return (
    <Box
      display={{ base: selectedChat ? 'flex' : 'none', md: 'flex' }}
      alignItems="center"
      flexDir="column"
      padding={3}
      background="white"
      width={{ base: '100%', md: '68%' }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat />
    </Box>
  );
};

export default ChatBox;
