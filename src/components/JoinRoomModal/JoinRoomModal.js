import React, { useState } from 'react';
import { useDisclosure } from '@chakra-ui/hooks';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';

const JoinRoomModal = ({ children, reload }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const history = useHistory();
  const { id } = useParams();
  const toast = useToast();

  const toggleRoomPasswordShow = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (!children) {
      onOpen();
    }
    if (id) {
      setRoomName(id);
    }
  }, [children, id, onOpen]);

  const onCancel = () => {
    history.push('/');
    onClose();
  };

  const handleSubmit = async () => {
    try {
      if (!roomName) {
        toast({
          title: 'Please enter the room ID...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      if (!password) {
        toast({
          title: 'Please enter the room password...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      localStorage.removeItem('roomCreds');
      localStorage.setItem(
        'roomCreds',
        JSON.stringify({ _id: roomName, roomPassword: password }),
      );
      history.push(`/room/${roomName}`);
      if (reload === true) {
        window.location.reload();
      }
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
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Join ChatRoom
          </ModalHeader>
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl isRequired>
              <FormLabel>Room ID</FormLabel>
              <Input
                placeholder="Enter unique room ID"
                mb={3}
                value={roomName}
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
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onCancel}>
              Cancel
            </Button>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Join Private Room
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default JoinRoomModal;
