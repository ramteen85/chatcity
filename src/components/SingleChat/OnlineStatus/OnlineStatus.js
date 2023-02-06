import { Avatar, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { getSenderFull } from '../../../config/ChatLogics';

const OnlineStatus = () => {
  const user = useSelector((state) => state.auth.user);
  const selectedChat = useSelector((state) => state.chat.selectedChat);

  const onlineStyle = {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    background: '#31A24C',
    position: 'absolute',
    bottom: 0,
    right: -5,
  };
  const offlineStyle = {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    background: 'red',
    position: 'absolute',
    bottom: 0,
    right: -5,
  };

  return (
    <Tooltip
      placement="end"
      label={
        getSenderFull(user, selectedChat.users).online
          ? `${getSenderFull(user, selectedChat.users).name} is online...`
          : `${getSenderFull(user, selectedChat.users).name} is offline...`
      }
      hasArrow
    >
      <Avatar
        src={getSenderFull(user, selectedChat.users).pic}
        position="relative"
        cursor="pointer"
      >
        <span
          style={
            getSenderFull(user, selectedChat.users).online ? onlineStyle : offlineStyle
          }
        ></span>
      </Avatar>
    </Tooltip>
  );
};

export default OnlineStatus;
