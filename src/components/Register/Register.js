import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions } from '../../store/notification';
import {
  FormControl,
  VStack,
  Box,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  Img,
} from '@chakra-ui/react';
import { authActions } from '../../store/auth';

const Register = () => {
  const dispatch = useDispatch();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewSource, setPreviewSource] = useState();
  const loading = useSelector((state) => state.notification.loading);

  const toast = useToast();

  const toggleShow = (tag) => {
    if (tag === 'p') setShowPassword(!showPassword);
    if (tag === 'cp') setShowConfirmPassword(!showConfirmPassword);
  };

  const previewFile = (file) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreviewSource(reader.result);
      };
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

  const selectImage = (e) => {
    try {
      dispatch(notificationActions.startLoading());

      const file = e.target.files[0];
      previewFile(file);

      toast({
        title: 'Image ready for upload!',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      dispatch(notificationActions.stopLoading());
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

  const uploadImage = async (base64Image) => {
    try {
      dispatch(notificationActions.startLoading());

      if (!name || !email || !password || !confirmPassword) {
        toast({
          title: 'Please fill in all fields...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        dispatch(notificationActions.stopLoading());
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: 'Passwords do not match...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        dispatch(notificationActions.stopLoading());
        return;
      }

      let response = await fetch('/api/user', {
        method: 'post',
        body: JSON.stringify({ name, email, password, pic: base64Image }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Allow-Control-Origin': '*',
        },
      });

      response = await response.json();

      if (response.message !== 'Registration Successful!') throw Error(response.message);
      else {
        localStorage.setItem('userInfo', JSON.stringify(response));
        dispatch(notificationActions.stopLoading());
        toast({
          title: 'Welcome to ChatCity!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        });
        dispatch(authActions.setUser(response));
      }
    } catch (error) {
      dispatch(notificationActions.stopLoading());
      toast({
        title: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    uploadImage(previewSource);
  };

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter your Name..."
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="remail" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter your Email..."
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="rpassword" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            placeholder="Enter your Password..."
            type={showPassword ? 'text' : 'password'}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button height="1.75rem" size="sm" onClick={() => toggleShow('p')}>
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            placeholder="Confirm your Password..."
            type={showConfirmPassword ? 'text' : 'password'}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button height="1.75rem" size="sm" onClick={() => toggleShow('cp')}>
              {showConfirmPassword ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input type="file" padding={1.5} onChange={selectImage} />
      </FormControl>
      {previewSource && (
        <Box width={'100%'} height="100" display={'flex'}>
          <Img
            width={`100`}
            height={`100`}
            src={previewSource}
            alt="user profile image upload chatcity"
          />
        </Box>
      )}
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Register
      </Button>
    </VStack>
  );
};

export default Register;
