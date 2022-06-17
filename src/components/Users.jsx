import styles from "./Users.module.scss";

const Users = ({ room }) => {
  return (
    <div className={styles.root}>
      <div>
        <div>Owner</div>
        <div>
          <b
            style={{
              color: room.owner.player.color,
            }}
          >
            {room.owner.player.nickname}
          </b>
        </div>
      </div>
      <div>
        <div>Opponent</div>
        <div>
          {room.opponent ? (
            <b
              style={{
                color: room.opponent.player.color,
              }}
            >
              {room.opponent.player.nickname}
            </b>
          ) : (
            <b>No one</b>
          )}
        </div>
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
