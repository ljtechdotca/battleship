import styles from "./Toolbar.module.scss";

const content = {
  idle: "Waiting for opponent...",
  preparation: "Placing ships...",
};

const Toolbar = ({
  fleet,
  onClick,
  opponentBoard,
  ownerBoard,
  player,
  room,
  ship,
}) => {
  const isOpponent = room.opponent && player.id === room.opponent.player.id;
  const isOwner = player.id === room.owner.player.id;
  const isPlaying = isOpponent || isOwner;
  const isReady =
    (isOpponent && room.opponent.isReady) || (isOwner && room.owner.isReady);

  return (
    <header className={styles.root}>
      <div className={styles.base}>
        <p className={styles.heading}>{content[room.state]}</p>
        {(isOpponent || isOwner) &&
          room.state === "preparation" &&
          Object.entries(fleet).map(([key, value]) => (
            <button
              className={
                ship && ship.name === value.name
                  ? "small purple"
                  : "small outline"
              }
              key={`fleet-${key}`}
              onClick={() => onClick.onShip({ value })}
            >
              [{value.size}] {value.name[0]}
            </button>
          ))}
      </div>
      <div className={styles.base}>
        {!isOpponent && !isOwner && room.state === "idle" && (
          <button className="small purple" onClick={onClick.onChallenge}>
            Challenge owner
          </button>
        )}
        {isPlaying && room.state === "preparation" && (
          <button
            className="small purple"
            onClick={() =>
              onClick.onNotReady({
                opponentBoard,
                ownerBoard,
              })
            }
          >
            Reset
          </button>
        )}
        {isPlaying && !isReady && room.state === "preparation" && (
          <button
            className="small purple"
            onClick={() => onClick.onReady({ opponentBoard, ownerBoard })}
          >
            Ready for battle
          </button>
        )}
        {isPlaying && room.state === "active" && (
          <button
            className="small red"
            onClick={() => onClick.onSurrender({ room })}
          >
            Surrender
          </button>
        )}
        <button className="small red" onClick={onClick.onLeave}>
          Leave room
        </button>
      </div>
    </header>
  );
};

export default Toolbar;
