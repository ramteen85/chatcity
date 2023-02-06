import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDisclosure } from '@chakra-ui/hooks';
import { notificationActions } from '../../store/notification';
import { roomActions } from '../../store/room';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

const CreateRoomModal = ({ children }) => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roomName, setRoomName] = useState();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [greeting, setGreeting] = useState(null);
  const [resultMode, setResultMode] = useState(false);
  const loading = useSelector((state) => state.notification.loading);
  const chatRoom = useSelector((state) => state.room.chatroom);
  const user = useSelector((state) => state.auth.user);
  const history = useHistory();
  const toast = useToast();

  const toggleRoomPasswordShow = () => setShowPassword(!showPassword);

  useEffect(() => {
    localStorage.removeItem('roomCreds');
  });

  const enterRoom = async () => {
    try {
      dispatch(notificationActions.startLoading());
      localStorage.setItem('roomCreds', JSON.stringify(chatRoom));
      history.push(`/room/${chatRoom.roomId}`);
    } catch (error) {
      toast({
        title: 'Error Occurred',
        description:
          'Failed to enter chat room. Please try joining manually or creating another room.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      dispatch(notificationActions.stopLoading());
      setResultMode(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // validation
      if (!roomName) {
        toast({
          title: 'You need a room name...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      if (!password) {
        toast({
          title: 'Please secure your room with a password...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      dispatch(notificationActions.startLoading());

      // create room
      let response = await fetch('/api/chat/room/create', {
        method: 'post',
        body: JSON.stringify({
          roomName,
          roomPassword: password,
          roomGreeting: greeting,
        }),
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      response = await response.json();

      dispatch(roomActions.setRoom(response));
      setResultMode(true);
      dispatch(notificationActions.stopLoading());
    } catch (error) {
      toast({
        title: 'Error Occurred',
        description: 'Failed to create chat room...',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      dispatch(notificationActions.stopLoading());
      setResultMode(false);
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      {!resultMode && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="35px"
              fontFamily="Work sans"
              display="flex"
              justifyContent="center"
            >
              Create ChatRoom
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody display="flex" flexDir="column" alignItems="center">
              <FormControl isRequired>
                <FormLabel>Room Name</FormLabel>
                <Input
                  placeholder="(ex: The Chill Zone)"
                  mb={3}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </FormControl>
              <FormControl id="room-password" isRequired>
                <FormLabel>Room Password</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="Password to join room..."
                    type={showPassword ? 'text' : 'password'}
                    mb={3}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      height="1.75rem"
                      size="sm"
                      onClick={() => toggleRoomPasswordShow('p')}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Room Greeting</FormLabel>
                <Input
                  placeholder="(ex: Welcome to my domain)"
                  mb={3}
                  onChange={(e) => setGreeting(e.target.value)}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={onClose}>
                Cancel
              </Button>
              {loading ? (
                <Spinner marginLeft="50px" />
              ) : (
                <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                  Create Private Room
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {resultMode && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          closeOnOverlayClick={false}
          closeOnEsc={false}
          isClosable={false}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="35px"
              fontFamily="Work sans"
              display="flex"
              justifyContent="center"
            >
              Chat Room Created
            </ModalHeader>
            <ModalBody display="flex" flexDir="column" alignItems="center">
              <Box>
                <Text>
                  You have successfully created a new chat room. Your room credentials
                  have been provided below. Please give this information to users whom you
                  wish to join your chat room as they will require it to gain entry.
                </Text>
                <Text marginTop="10px">
                  If you leave the room at any stage and wish to rejoin while it is still
                  active, you will need the <span style={{ color: 'red' }}>room ID</span>{' '}
                  and <span style={{ color: 'red' }}>password</span> again. If the room no
                  longer exists when you try to rejoin, simply create another one.
                </Text>
                <Text marginTop="10px" color="red">
                  Please ensure you save these credentials somewhere since you will not be
                  able to recover them again.
                </Text>
              </Box>

              <Box marginTop="30px" marginBottom="30px" width="100%">
                <Text>
                  <span style={{ color: 'red', marginRight: '30px' }}>
                    Chat Room ID:{' '}
                  </span>
                  {chatRoom?.roomId}
                </Text>
                <Text>
                  <span style={{ color: 'red', marginRight: '20px' }}>
                    Room Password:{' '}
                  </span>
                  {password}
                </Text>
              </Box>
            </ModalBody>

            <ModalFooter>
              {loading ? (
                <Text display="flex" alignItems="center">
                  <Spinner mr={3} />
                  Loading..
                </Text>
              ) : (
                <Button colorScheme="blue" mr={3} onClick={enterRoom}>
                  Enter Room
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default CreateRoomModal;
