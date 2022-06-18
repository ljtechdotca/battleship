import styles from "./Cell.module.scss";

const values = {
  0: "~",
  1: "☁",
  3: "📍",
  5: "D",
  6: "C",
  7: "S",
  8: "B",
  9: "A",
};

const Cell = ({ cell, indices, onCell }) => {
  return (
    <button
      className={styles[`root__${cell}`]}
      onClick={() => onCell({ target: [indices[0], indices[1]] })}
    >
      {values[cell]}
    </button>
  );
};

export default Cell;
