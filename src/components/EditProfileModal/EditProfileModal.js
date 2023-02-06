import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Image,
  Img,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import ConfirmDialogModal from '../ConfirmDialogModal/ConfirmDialogModal';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authActions } from '../../store/auth';
import { notificationActions } from '../../store/notification';
import { roomActions } from '../../store/room';
import { chatActions } from '../../store/chat';
import socket from '../../config/Socket';
import { useHistory } from 'react-router-dom';

const EditProfileModal = ({ user, children, style }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [previewSource, setPreviewSource] = useState();
  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [delAccPassword, setDelAccPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const loading = useSelector((state) => state.notification.loading);
  const uploadRef = useRef();
  const toast = useToast();
  const dispatch = useDispatch();
  const history = useHistory();

  const selectImage = (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
          setPreviewSource(reader.result);
        };
      } else {
        setPreviewSource();
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

  const deleteAccount = async (onClose) => {
    try {
      if (!delAccPassword) {
        toast({
          title: 'Please enter your password...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        onClose();
        return;
      }

      // proceed...
      let response = await fetch('/api/user/terminate', {
        method: 'post',
        body: JSON.stringify({ password: delAccPassword }),
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
          'Access-Allow-Control-Origin': '*',
        },
      });

      response = await response.json();

      if (response.message === 'User terminated. Goodbye...') {
        // get rid of local storage
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userCreds');

        // set redux stuff to null
        dispatch(roomActions.setRoom(null));
        dispatch(authActions.setUser(null));
        dispatch(chatActions.setChats(null));
        dispatch(chatActions.setSelectedChat(null));

        // disconnect from socket
        socket.disconnect();

        // go back to homepage
        history.push('/');

        // wrap up modal
        setDelAccPassword('');
        onClose();
      } else {
        toast({
          title: response.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        onClose();
      }
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

  const changePassword = async () => {
    try {
      if (!oldPassword) {
        toast({
          title: 'Please enter your current password...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      if (!password) {
        toast({
          title: 'Please enter new password...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      if (!confirmPassword) {
        toast({
          title: 'Please confirm your new password...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: 'New Passwords must match...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      let response = await fetch('/api/user/edit/password', {
        method: 'post',
        body: JSON.stringify({ oldPassword: oldPassword, password: password }),
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
          'Access-Allow-Control-Origin': '*',
        },
      });

      response = await response.json();

      if (response.message === 'Password Reset Successful!') {
        setOldPassword('');
        setPassword('');
        setConfirmPassword('');
        toast({
          title: 'Password Reset Successful!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } else {
        toast({
          title: response.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }
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

  const changeName = async () => {
    try {
      if (!name) {
        toast({
          title: 'Please enter new name...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      let response = await fetch('/api/user/edit/name', {
        method: 'post',
        body: JSON.stringify({ name: name }),
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
          'Access-Allow-Control-Origin': '*',
        },
      });

      response = await response.json();

      if (response.message === 'Name Change Successful!') {
        toast({
          title: 'Name Changed Successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });

        // change localStorage
        const temp = JSON.parse(localStorage.getItem('userInfo'));
        temp.name = name;
        localStorage.setItem('userInfo', JSON.stringify(temp));

        // change dp
        dispatch(authActions.updateName(name));

        setName(name);
      }
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

  const uploadImage = async () => {
    try {
      if (!previewSource) {
        toast({
          title: 'Please attach an image...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        return;
      }

      dispatch(notificationActions.startLoading());

      let response = await fetch('/api/user/edit/pic', {
        method: 'post',
        body: JSON.stringify({ pic: previewSource }),
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
          'Access-Allow-Control-Origin': '*',
        },
      });

      response = await response.json();

      if (response.message === 'Upload Successful!') {
        dispatch(notificationActions.stopLoading());
        toast({
          title: 'Image Upload Successful!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });

        // change localStorage
        const temp = JSON.parse(localStorage.getItem('userInfo'));
        temp.pic = response.pic;
        temp.pic_secure = response.pic_secure;
        localStorage.setItem('userInfo', JSON.stringify(temp));

        // change dp
        dispatch(
          authActions.updatePic({ pic: response.pic, pic_secure: response.pic_secure }),
        );

        // refresh
        setPreviewSource();
        uploadRef.current.value = '';
      } else {
        throw Error(
          'Unable to upload new display pic. Try again later or with a different file format.',
        );
      }
    } catch (error) {
      toast({
        title: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      dispatch(notificationActions.stopLoading());
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent height="800px">
          <ModalHeader
            fontSize="30px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            <Image
              borderRadius="full"
              boxSize="50px"
              marginBottom="10px"
              marginRight="20px"
              src={user.pic}
              alt={user.name}
            />
            Edit Profile
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody display="flex" flexDir="column" flex="1">
            <Box alignItems="center" display="flex" justifyContent="center"></Box>
            <Box>
              <Tabs variant="soft-rounded">
                <TabList mb="1em">
                  <Tab width="50%">Details</Tab>
                  <Tab width="50%">Account</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Box
                      border="1px solid black"
                      padding="1rem"
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                    >
                      <FormControl id="remail">
                        <FormLabel>Email</FormLabel>
                        <Input
                          placeholder="Enter your Email..."
                          onChange={(e) => {}}
                          disabled
                          value={user.email}
                        />
                      </FormControl>
                      <FormControl id="first-name">
                        <FormLabel>Name</FormLabel>
                        <Input
                          placeholder="Enter your Name..."
                          defaultValue={user.name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </FormControl>
                      <Button margin="20px auto 10px auto" onClick={changeName}>
                        Save Changes
                      </Button>
                    </Box>

                    <Box
                      border="1px solid black"
                      padding="1rem"
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      marginTop="5px"
                    >
                      <FormControl
                        id="pic"
                        display="flex"
                        flexDirection="column"
                        marginTop="10px"
                      >
                        <FormLabel>New Profile Pic</FormLabel>
                        <Input
                          type="file"
                          ref={uploadRef}
                          padding={1.5}
                          onChange={selectImage}
                        />
                      </FormControl>
                      {previewSource && (
                        <Box width={'100%'} height="auto" display={'flex'}>
                          <Img
                            width={`100`}
                            height={`100`}
                            src={previewSource}
                            alt="user profile image upload chatcity"
                            marginTop="10px"
                          />
                          <Button
                            margin="20px auto 10px auto"
                            onClick={uploadImage}
                            isLoading={loading}
                          >
                            Upload
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </TabPanel>
                  <TabPanel>
                    <Box
                      border="1px solid black"
                      padding="1rem"
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                    >
                      <FormControl display="flex" flexDirection="column" marginTop="10px">
                        <FormLabel>Account Security</FormLabel>
                        <Input
                          type="password"
                          value={oldPassword}
                          padding={1.5}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Old password..."
                        />
                        <Input
                          type="password"
                          marginTop="5px"
                          value={password}
                          padding={1.5}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="New password..."
                        />
                        <Input
                          type="password"
                          placeholder="Confirm New password..."
                          value={confirmPassword}
                          marginTop="5px"
                          padding={1.5}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </FormControl>
                      <Button margin="20px auto 10px auto" onClick={changePassword}>
                        Change Password
                      </Button>
                    </Box>

                    <Box
                      border="1px solid black"
                      padding="1rem"
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      marginTop="5px"
                    >
                      <FormControl display="flex" flexDirection="column" marginTop="10px">
                        <FormLabel>Delete Account</FormLabel>
                        <Input
                          type="password"
                          placeholder="Your password..."
                          padding={1.5}
                          value={delAccPassword}
                          onChange={(e) => setDelAccPassword(e.target.value)}
                        />
                      </FormControl>
                      <Box margin="20px auto 10px auto">
                        <ConfirmDialogModal
                          message={
                            'Are you sure you want to delete your account? If you proceed, this action is irreversible unless you re-register.'
                          }
                          yesOperation={deleteAccount}
                        >
                          <Button>Terminate</Button>
                        </ConfirmDialogModal>
                      </Box>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProfileModal;
