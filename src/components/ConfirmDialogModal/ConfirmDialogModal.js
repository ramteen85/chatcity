import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';

const ConfirmDialogModal = ({ children, message, yesOperation, noOperation }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent height="auto">
          <ModalHeader
            fontSize="30px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Confirmation
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody display="flex" flexDir="column" flex="1">
            {message}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={noOperation ? noOperation : onClose}
            >
              No
            </Button>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={yesOperation ? () => yesOperation(onClose) : onClose}
            >
              Yes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConfirmDialogModal;
