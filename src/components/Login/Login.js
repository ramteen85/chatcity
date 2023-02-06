import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notificationActions } from '../../store/notification';
import {
  FormControl,
  VStack,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from '@chakra-ui/react';
import { authActions, setAuthTimer } from '../../store/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loading = useSelector((state) => state.notification.loading);
  const toast = useToast();
  const dispatch = useDispatch();

  const toggleShow = (tag) => {
    if (tag === 'p') setShowPassword(!showPassword);
  };

  const submitHandler = async (e) => {
    try {
      e.preventDefault();
      if (!email || !password) {
        toast({
          title: 'Please fill in all fields...',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });

        return;
      }

      dispatch(notificationActions.startLoading());

      let response = await fetch('/api/user/login', {
        method: 'post',
        body: JSON.stringify({ email, password }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Allow-Control-Origin': '*',
        },
      });

      response = await response.json();

      if (response.message !== 'Login Successful!') throw Error(response.message);
      else {
        dispatch(notificationActions.stopLoading());
        dispatch(authActions.loginHandler(response));
        dispatch(setAuthTimer());
      }

      toast({
        title: 'Welcome to ChatCity!',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      localStorage.removeItem('userInfo');
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
    <VStack spacing="5px">
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          placeholder="Enter your Email..."
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            placeholder="Enter your Password..."
            type={showPassword ? 'text' : 'password'}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <InputRightElement width="4.5rem">
            <Button height="1.75rem" size="sm" onClick={() => toggleShow('p')}>
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>
    </VStack>
  );
};

export default Login;
