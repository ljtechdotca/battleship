import Player from "./Player";
import styles from "./Rooms.module.scss";

const Rooms = ({ rooms, onCreate, onJoin }) => {
  return (
    <div className={styles.root}>
      <p>
        Choose a room to play in,
        <br />
        or create your own.
      </p>
      {rooms.map(({ id, owner }) => (
        <div className={styles.base} key={id}>
          <Player player={owner.player} />
          <button
            className="outline purple small"
            onClick={() => onJoin({ roomId: id })}
          >
            Join
          </button>
        </div>
      ))}
      <button className="purple" onClick={onCreate}>
        Create room
      </button>
    </div>
  );
};

export default Rooms;
