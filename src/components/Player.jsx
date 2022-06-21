function Player({ player }) {
  return <b style={{ color: player.color }}>{player.nickname}</b>;
}

export default Player;
