import styles from "./Console.module.scss";

const Console = ({ logs }) => {
  return (
    <div className={styles.root}>
      {logs.map((log) => (
        <div key={log.id}>
          <span className="small">{`${new Date(log.datetime).toLocaleTimeString(
            ["en-GB"],
            { hour: "2-digit", minute: "2-digit" }
          )} `}</span>
          <span>
            <b
              style={{
                color: log.player.color,
              }}
            >
              {`${log.player.nickname}: `}
            </b>
          </span>
          <span>{log.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Console;
