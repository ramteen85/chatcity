import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Avatar, Tooltip, IconButton, useToast } from '@chakra-ui/react';
import { Box, Stack, Text } from '@chakra-ui/layout';
import React from 'react';
import socket from '../../config/Socket';
import { roomActions } from '../../store/room';
import ProfileModal from '../ProfileModal/ProfileModal';
import { ArrowForwardIcon } from '@chakra-ui/icons';

const Participants = ({ participantWindow, setParticipantWindow }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const chatroom = useSelector((state) => state.room.chatroom);
  const user = useSelector((state) => state.auth.user);
  const { id } = useParams();
  const toast = useToast();

  const leaveRoom = async () => {
    try {
      localStorage.removeItem('roomCreds');
      dispatch(roomActions.setRoom(null));
      // reach out to server and "leave room"
      await fetch('/api/chat/room/leave', {
        method: 'post',
        body: JSON.stringify({
          roomId: id,
        }),
        headers: {
          Authorization: `Bearer ${user ? user.token : user.token}`,
          'Content-Type': 'application/json',
        },
      });
      // send out socket to everyone notifying them
      if (user && id) socket.emit('byebye', { id, user });
      history.push('/');
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

  const display = participantWindow
    ? { base: 'flex', md: 'flex' }
    : { base: 'none', md: 'flex' };

  return (
    <Box
      display={display}
      flexDir="column"
      alignItems="center"
      padding={3}
      bg="white"
      width={{ base: '100%', md: '30%' }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        display="flex"
        flexWrap="wrap"
        width="100%"
        marginBottom="20px"
        fontSize={{ base: '25px', md: '18px', lg: '25px' }}
      >
        {chatroom && chatroom.roomName ? chatroom.roomName : ''}
      </Box>
      <Box
        pb={3}
        fontSize={{ base: '23px', md: '14px', lg: '23px' }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        Participants
        <Button
          display="flex"
          color="white"
          background="red"
          _hover={{
            color: 'red',
            background: 'white',
            border: '3px solid red',
            fontWeight: 'bold',
          }}
          width={{ base: '100px', md: '70px', lg: '120px' }}
          fontSize={{ base: '17px', md: '10px', lg: '17px' }}
          onClick={leaveRoom}
        >
          Leave Room
        </Button>
      </Box>
      <Box
        pb={3}
        fontSize={{ base: '23px', md: '14px', lg: '23px' }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize={{ base: '20px', md: '12px', lg: '20px' }} width="100%">
          Total Users: {chatroom?.users?.length}
        </Text>

        <IconButton
          display={{ base: 'flex', md: 'none' }}
          icon={<ArrowForwardIcon />}
          onClick={() => setParticipantWindow(false)}
        />
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
        <Stack overflowY="scroll">
          {chatroom?.users?.map((participant) => (
            <Box
              display="flex"
              alignItems="center"
              bg={'white'}
              color={'black'}
              px={3}
              py={2}
              borderRadius="lg"
              key={participant._id}
            >
              <Avatar width="30px" height="30px" src={participant.pic} />
              <Text fontSize={{ base: '18px', md: '10px', lg: '18px' }} marginLeft="10px">
                {participant.name}
              </Text>
              <Tooltip placement="end" label={`View Profile`} hasArrow>
                <div>
                  <ProfileModal style={{ marginLeft: '10px' }} user={participant} />
                </div>
              </Tooltip>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Participants;
