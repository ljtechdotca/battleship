import Player from "./Player";
import styles from "./Users.module.scss";

const Users = ({ room }) => {
  return (
    <div className={styles.root}>
      <div>
        <div>Owner</div>
        <div>
          <Player player={room.owner.player} />
        </div>
      </div>
      <div>
        <div>Opponent</div>
        <div>{room.opponent && <Player player={room.opponent.player} />}</div>
      </div>
      <div>
        <div>Viewers</div>
        <div>
          {room.viewers.map((viewer) => (
            <div key={viewer.id}>
              <b
                style={{
                  color: viewer.color,
                }}
              >
                {viewer.nickname}
              </b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Users;
