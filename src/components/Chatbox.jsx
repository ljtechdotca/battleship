import styles from "./Chatbox.module.scss";
import Chat from "./Chat";
import Users from "./Users";


const Chatbox = ({chat, onChat, room}) => {
  return (
    <div className={styles.root}>
      <Users room={room} />
      <Chat chat={chat} onChat={onChat} />
    </div>
  );
};

export default Chatbox;
