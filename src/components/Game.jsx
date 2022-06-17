import Board from "./Board";
import Console from "./Console";
import styles from "./Game.module.scss";
import Toolbar from "./Toolbar";

const Game = ({
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
      <Toolbar
        fleet={fleet}
        onClick={onClick}
        opponentBoard={opponentBoard}
        ownerBoard={ownerBoard}
        player={player}
        room={room}
        ship={ship}
      />
      {room.opponent && (
        <div className={styles.base}>
          <Board
            logs={logs}
            onCell={(event) =>
              onClick.onCell({
                ...event,
                fleet,
                opponentBoard,
                ownerBoard,
                player,
                room,
                ship,
              })
            }
            opponentBoard={opponentBoard}
            ownerBoard={ownerBoard}
            player={player}
            room={room}
          />
          <Console logs={logs} />
        </div>
      )}
    </div>
  );
};

export default Game;
