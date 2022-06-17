import styles from "./Cell.module.scss";

const values = {
  0: "~",
  1: "miss",
  2: "ship",
  3: "hit",
  4: "sunken",
  5: "D",
  6: "C",
  7: "S",
  8: "B",
  9: "A",
};

const Cell = ({ cell, indices, onCell }) => {
  return (
    <button
      className={styles.root}
      onClick={() => onCell({ target: [indices[0], indices[1]] })}
      style={{
        backgroundColor:
          cell > 4 ? `hsl(${(cell * 30) % 360}, 100%, 75%)` : "inherit",
        color: cell > 4 ? `hsl(${(cell * 30) % 360}, 50%, 50%)` : "inherit",
      }}
    >
      {values[cell]}
    </button>
  );
};

export default Cell;
