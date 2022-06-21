import styles from "./Header.module.scss";
import Player from "./Player";

const Header = ({ player, onSignOut }) => {
  return (
    <header className={styles.root}>
      <div>🚢 Battleship</div>
      <div>
        {player && (
          <div className={styles.base}>
            <Player player={player} />
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
