import React from 'react';
import { Box } from '@chakra-ui/layout';
import MultiChat from '../MultiChat/MultiChat';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';

const ChatWindow = ({ participantWindow, setParticipantWindow }) => {
  const display = participantWindow
    ? { base: 'none', md: 'flex' }
    : { base: 'flex', md: 'flex' };

  return (
    <Box
      display={display}
      alignItems="center"
      flexDir="column"
      padding={3}
      background="white"
      width={{ base: '100%', md: '69%' }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box width={'100%'} marginBottom="10px">
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          icon={<ArrowBackIcon />}
          onClick={() => setParticipantWindow(true)}
        />
      </Box>
      <MultiChat />
    </Box>
  );
};

export default ChatWindow;
