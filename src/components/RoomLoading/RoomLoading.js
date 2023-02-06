import { Box } from '@chakra-ui/layout';
import { Spinner } from '@chakra-ui/react';
import React from 'react';

const RoomLoading = () => {
  return (
    <Box
      display={'flex'}
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      padding={3}
      background="white"
      width={'100%'}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Spinner width="20rem" height="20rem" title="Loading Chat Room..." />
    </Box>
  );
};

export default RoomLoading;
