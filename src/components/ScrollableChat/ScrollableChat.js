import { Avatar, Tooltip } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isSameUser,
} from '../../config/ChatLogics';

const ScrollableChat = () => {
  const user = useSelector((state) => state.auth.user);
  const messages = useSelector((state) => state.chat.messages);
  const topRef = useRef();

  return (
    <div>
      <span ref={topRef}></span>
      {messages &&
        messages.length > 0 &&
        messages.map((m, i) => (
          <div style={{ display: 'flex' }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}

            <span
              style={{
                backgroundColor: `${m.sender._id === user._id ? '#bee3f8' : '#b9f5d0'}`,
                borderRadius: '20px',
                padding: '5px 15px',
                maxWidth: '75%',
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
    </div>
  );
};

export default ScrollableChat;
