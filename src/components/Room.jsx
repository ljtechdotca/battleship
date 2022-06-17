import Chatbox from "./Chatbox";
import Game from "./Game";
import styles from "./Room.module.scss";

const Room = ({
  chat,
  fleet,
  logs,
  onClick,
  opponentBoard,
  ownerBoard,
  player,
  room,
  ship,
}) => {
  return (
    <div className={styles.root}>
      <Game
        fleet={fleet}
        logs={logs}
        onClick={onClick}
        opponentBoard={opponentBoard}
        ownerBoard={ownerBoard}
        player={player}
        room={room}
        ship={ship}
      />
      <Chatbox chat={chat} onChat={onClick.onChat} room={room} />
    </div>
  );
};

export default Room;
