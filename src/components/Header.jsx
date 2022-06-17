import styles from "./Header.module.scss";

const Header = ({ player, onSignOut }) => {
  return (
    <header className={styles.root}>
      <div>🚢 Battleship</div>
      <div>
        {player && (
          <div className={styles.base}>
            <b style={{ color: player.color }}>
              {player.nickname}
            </b>
            <button onClick={onSignOut} className="small">
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
