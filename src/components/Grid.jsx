import Cell from "./Cell";
import styles from "./Grid.module.scss";
import Player from "./Player";

const yScale = "ABCDEFGHIJ".split("");
const xScale = "0123456789".split("");

const Grid = ({ board, onCell, player, primary }) => {
  return (
    <div
      className={primary ? styles.root__primary : styles.root}
      style={{ borderColor: player.color }}
    >
      <div>
        <Player player={player} />
      </div>
      <div>
        {board &&
          board.map((row, i) => (
            <div className={styles.row} key={"row-" + i}>
              {primary && <div className={styles.cell}>{yScale[i]}</div>}
              {row.map((cell, j) =>
                primary ? (
                  <Cell
                    cell={cell}
                    onCell={onCell}
                    key={"cell" + i + j}
                    indices={[i, j]}
                  />
                ) : (
                  <div
                    className={styles.cell__border}
                    key={"cell" + i + j}
                    style={{
                      backgroundColor:
                        cell > 4
                          ? `hsl(${(cell * 30) % 360}, 100%, 75%)`
                          : "inherit",
                    }}
                  />
                )
              )}
            </div>
          ))}
        {primary && (
          <div className={styles.row}>
            <div className={styles.cell} />
            {xScale.map((cell, i) => (
              <div className={styles.cell} key={"x" + i}>
                {cell}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Grid;
