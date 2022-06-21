import { useEffect, useRef } from "react";
import styles from "./Console.module.scss";

const Console = ({ logs }) => {
  const consoleRef = useRef();

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scroll({
        top: consoleRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs]);

  return (
    <div className={styles.root} ref={consoleRef}>
      {logs.map((log) => (
        <div key={log.id}>{log.element}</div>
      ))}
    </div>
  );
};

export default Console;
