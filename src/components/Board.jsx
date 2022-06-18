import styles from "./Board.module.scss";
import Grid from "./Grid";

const Board = ({ onCell, opponentBoard, ownerBoard, player, room }) => {
  const isOwner = player.id === room.owner.player.id;

  return (
    <div className={styles.root}>
      <div className={styles.base}>
        {isOwner && room.state === "preparation" && (
          <>
            <Grid board={ownerBoard} onCell={onCell} player={player} primary />
            <Grid board={opponentBoard} player={room.opponent.player} />
          </>
        )}
        {!isOwner && room.state === "preparation" && (
          <>
            <Grid
              board={opponentBoard}
              onCell={onCell}
              player={player}
              primary
            />
            <Grid board={ownerBoard} player={room.owner.player} />
          </>
        )}
        {isOwner && room.state === "active" && (
          <>
            <Grid
              board={opponentBoard}
              onCell={onCell}
              player={room.opponent.player}
              primary
            />
            <Grid board={ownerBoard} player={player} />
          </>
        )}
        {!isOwner && room.state === "active" && (
          <>
            <Grid
              board={ownerBoard}
              onCell={onCell}
              player={room.owner.player}
              primary
            />
            <Grid board={opponentBoard} player={player} />
          </>
        )}
      </div>
    </div>
  );
};

export default Board;
