/* eslint-disable no-unused-vars */
import styles from "./App.module.scss";
import Header from "./components/Header";
import Room from "./components/Room";
import Rooms from "./components/Rooms";
import SignIn from "./components/SignIn";
import useInitWebSocket from "./hooks/use-init-web-socket";

function App() {
  // This custom React hook handles it all
  const {
    chat,
    error,
    fleet,
    logs,
    onClick,
    opponentBoard,
    ownerBoard,
    player,
    room,
    rooms,
    ship,
  } = useInitWebSocket();

  return (
    <div className={styles.root}>
      <Header player={player} onSignOut={onClick.onSignOut} />
      <main>
        {player && !room && (
          <Rooms
            rooms={rooms}
            onCreate={onClick.onCreate}
            onJoin={onClick.onJoin}
          />
        )}
        {!player && <SignIn onSignIn={onClick.onSignIn} />}
        {error && <div className={styles.error}>{error}</div>}
        {player && room && (
          <Room
            chat={chat}
            fleet={fleet}
            logs={logs}
            onClick={onClick}
            opponentBoard={opponentBoard}
            ownerBoard={ownerBoard}
            player={player}
            room={room}
            ship={ship}
          />
        )}
      </main>
    </div>
  );
}

export default App;
