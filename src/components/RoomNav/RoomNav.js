import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Avatar } from '@chakra-ui/avatar';
import ProfileModal from '../ProfileModal/ProfileModal';
import { useHistory, useParams } from 'react-router-dom';
import { roomActions } from '../../store/room';
import { authActions } from '../../store/auth';
import socket from '../../config/Socket';
import { chatActions } from '../../store/chat';
import { notificationActions } from '../../store/notification';

const RoomNav = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.auth.user);
  const { id } = useParams();
  const toast = useToast();

  const logoutHandler = async () => {
    try {
      await leaveRoom();
      dispatch(authActions.logoutHandler());
      dispatch(chatActions.logoutHandler());
      dispatch(notificationActions.logoutHandler());
      dispatch(roomActions.logoutHandler());
      history.replace('/');
      socket.disconnect();
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

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        width="100%"
        padding="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Text fontSize="2xl" fontFamily="Work Sans">
          ChatCity
        </Text>

        <Text fontSize="2xl" fontFamily="Work Sans"></Text>

        <div>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer" src={[user.pic]} name={user.name} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuItem onClick={leaveRoom}>Leave Room</MenuItem>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
    </>
  );
};

export default RoomNav;
