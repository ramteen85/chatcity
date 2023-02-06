import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, useToast } from '@chakra-ui/react';
import RoomNav from '../../components/RoomNav/RoomNav';
import Participants from '../../components/Participants/Participants';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import RoomLoading from '../../components/RoomLoading/RoomLoading';
import JoinRoomModal from '../../components/JoinRoomModal/JoinRoomModal';
import { useHistory, useParams } from 'react-router-dom';
import { roomActions } from '../../store/room';
import useRoomSockets from '../../hooks/useRoomSockets';
import socket from '../../config/Socket';

const Room = () => {
  const user = useSelector((state) => state.auth.user);
  const chatroom = useSelector((state) => state.room.chatroom);
  const passReady = useSelector((state) => state.room.passReady);
  const { id } = useParams();
  const [participantWindow, setParticipantWindow] = useState(true);
  const dispatch = useDispatch();
  const toast = useToast();
  const history = useHistory();
  useRoomSockets();

  const checkPassword = useCallback(async () => {
    try {
      const roomCreds = JSON.parse(localStorage.getItem('roomCreds'));
      console.log('check password');

      let response = await fetch('/api/chat/room/join', {
        method: 'post',
        body: JSON.stringify({
          roomId: id,
          roomPassword: roomCreds.roomPassword,
        }),
        headers: {
          Authorization: `Bearer ${user ? user.token : user.token}`,
          'Content-Type': 'application/json',
        },
      });

      response = await response.json();

      if (response.message) throw Error(response.message);
      dispatch(roomActions.setRoom(response));
      dispatch(roomActions.setPassReady(true));
      socket.emit('joinRoom', { chatroom: response, user });
    } catch (error) {
      localStorage.removeItem('roomCreds');
      dispatch(roomActions.setPassReady(false));
      toast({
        title: 'Error Occurred',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatroom, dispatch, history, id, toast, user]);

  useEffect(() => {
    // check room password
    const roomCreds = JSON.parse(localStorage.getItem('roomCreds'));
    if (roomCreds) {
      // if correct, load chat room
      checkPassword();
    } else {
      // if incorrect, display error message and go back to chats
      history.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {user && <RoomNav />}
      {passReady ? (
        <Box
          display="flex"
          justifyContent="space-between"
          width="100%"
          height="90vh"
          padding="10px"
        >
          {/* chatroom object needs to be returned */}
          {user && (
            <Participants
              participantWindow={participantWindow}
              setParticipantWindow={setParticipantWindow}
            />
          )}
          {user && (
            <ChatWindow
              participantWindow={participantWindow}
              setParticipantWindow={setParticipantWindow}
            />
          )}
        </Box>
      ) : (
        <Box
          display="flex"
          justifyContent="space-between"
          width="100%"
          height="90vh"
          padding="10px"
        >
          <RoomLoading />
          {!passReady && <JoinRoomModal />}
        </Box>
      )}
    </div>
  );
};

export default Room;
