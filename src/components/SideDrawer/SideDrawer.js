import React, { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  useToast,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '@chakra-ui/avatar';
import ProfileModal from '../ProfileModal/ProfileModal';
import { useHistory } from 'react-router-dom';
import { useDisclosure } from '@chakra-ui/hooks';
import ChatLoading from '../ChatLoading/ChatLoading';
import UserListItem from '../UserAvatar/UserListItem/UserListItem';
import { getSender } from '../../config/ChatLogics';
import CreateRoomModal from '../CreateRoomModal/CreateRoomModal';
import { Effect } from 'react-notification-badge';
import NotificationBadge from 'react-notification-badge/lib/components/NotificationBadge';
import JoinRoomModal from '../JoinRoomModal/JoinRoomModal';
import { chatActions } from '../../store/chat';
import { notificationActions } from '../../store/notification';
import { authActions } from '../../store/auth';
import { roomActions } from '../../store/room';
import socket from '../../config/Socket';
import classes from './SideDrawer.module.scss';
import EditProfileModal from '../EditProfileModal/EditProfileModal';

const SideDrawer = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const loading = useSelector((state) => state.notification.loading);
  const loadingChat = useSelector((state) => state.chat.loading);
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state) => state.chat.chats);
  const notification = useSelector((state) => state.notification.notification);

  const logoutHandler = () => {
    try {
      dispatch(authActions.logoutHandler());
      dispatch(chatActions.logoutHandler());
      dispatch(notificationActions.logoutHandler());
      dispatch(roomActions.logoutHandler());
      history.replace('/');
      socket.disconnect();
    } catch (error) {
      toast({
        title: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleSearch = async (e) => {
    try {
      e.preventDefault();
      dispatch(notificationActions.startLoading());
      if (!search) {
        toast({
          title: 'Please enter something in search...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top-left',
        });
        dispatch(notificationActions.stopLoading());
        return;
      }
      let response = await fetch(`/api/user?search=${search}`, {
        method: 'get',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      response = await response.json();
      dispatch(notificationActions.stopLoading());
      setSearchResult(response);
    } catch (error) {
      dispatch(notificationActions.stopLoading());
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

  const accessChat = async (userId) => {
    try {
      dispatch(chatActions.startLoading());

      let response = await fetch(`/api/chat`, {
        method: 'post',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      response = await response.json();

      if (!chats.find((c) => c._id === response._id))
        dispatch(chatActions.setChats([response, ...chats]));
      dispatch(chatActions.setSelectedChat(response));
      dispatch(chatActions.stopLoading());
      onClose();
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
        <Tooltip label="Find and message a friend..." hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <FontAwesomeIcon icon={faSearch} />
            <Text display={{ base: 'none', md: 'flex' }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work Sans">
          ChatCity
        </Text>
        <div>
          <Menu>
            <MenuButton padding={1} marginRight="20px">
              <NotificationBadge count={notification.length} effect={Effect.scale} />
              <BellIcon fontSize="2xl" margin={1} />
            </MenuButton>
            <MenuList paddingLeft={2}>
              {!notification.length && 'No new messages...'}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    const users = notif.chat.users;
                    const usersArr = [];
                    users.forEach((user) => {
                      const userObj = {
                        ...user,
                        online: true,
                      };
                      usersArr.push(userObj);
                    });
                    const chat = { ...notif.chat, users: usersArr };
                    dispatch(chatActions.setSelectedChat(chat));
                    const filter = chats.filter((c) => c._id === chat._id);
                    if (filter.length === 0) {
                      dispatch(chatActions.setChats([chat, ...chats]));
                    }
                    dispatch(
                      notificationActions.setNotification(
                        notification.filter((n) => n !== notif),
                      ),
                    );
                  }}
                >
                  New Message from {`${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer" src={[user.pic]} name={user.name} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <EditProfileModal user={user}>
                <MenuItem>Edit Profile</MenuItem>
              </EditProfileModal>
              <CreateRoomModal>
                <MenuItem>Create Chatroom</MenuItem>
              </CreateRoomModal>
              <JoinRoomModal>
                <MenuItem>Join Chatroom</MenuItem>
              </JoinRoomModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" paddingBottom="2">
              <Input
                placeholder="Search by Name or Email..."
                marginRight="2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((u) => (
                <UserListItem
                  key={u._id}
                  user={u}
                  handleFunction={() => accessChat(u._id)}
                />
              ))
            )}
            {searchResult && searchResult.length > 0 && (
              <Button
                className={classes['clear-btn']}
                onClick={() => setSearchResult([])}
              >
                Clear Results
              </Button>
            )}
            {loadingChat && <Spinner marginLeft="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
