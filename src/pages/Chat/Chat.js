import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@chakra-ui/react';
import SideDrawer from '../../components/SideDrawer/SideDrawer';
import MyChats from '../../components/MyChats/MyChats';
import ChatBox from '../../components/ChatBox/ChatBox';
import useSocketSetup from '../../hooks/useSocketSetup';

const Chat = () => {
  const user = useSelector((state) => state.auth.user);
  useSocketSetup();
  return (
    <div style={{ width: '100%' }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        width="100%"
        height="90vh"
        padding="10px"
      >
        {user && <MyChats />}
        {user && <ChatBox />}
      </Box>
    </div>
  );
};

export default Chat;
