import { Avatar } from '@chakra-ui/avatar';
import { Tooltip } from '@chakra-ui/react';
import React from 'react';
import classes from './Typing.module.scss';

const Typing = ({ sender }) => {
  return (
    <div className={`${classes['typing']}`}>
      {sender && (
        <>
          <Tooltip
            label={`${sender.name} is typing a message...`}
            placement="auto"
            hasArrow
          >
            <div
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Avatar
                mt="7px"
                mr={1}
                size="sm"
                cursor="pointer"
                name={sender.name}
                src={sender.pic}
              />
              <div className={`${classes['typing__dot']}`}></div>
              <div className={`${classes['typing__dot']}`}></div>
              <div className={`${classes['typing__dot']}`}></div>
            </div>
          </Tooltip>
        </>
      )}
    </div>
  );
};

export default Typing;
