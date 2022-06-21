import send from "../server/send";

function createShips(board) {
  let ships = {};

  for (let iy = 0; iy < board.length; iy++) {
    for (let ix = 0; ix < board[iy].length; ix++) {
      if (board[iy][ix] === 0) continue;

      if (!(board[iy][ix] in ships)) {
        ships[board[iy][ix]] = {
          x: ix,
          y: iy,
          size: 0,
          isVertical: false,
          tag: board[iy][ix],
        };
      }

      let ship = ships[board[iy][ix]];

      if (ship.x !== ix && ship.y !== iy) return false;

      let size = Math.max(Math.abs(ship.x - ix), Math.abs(ship.y - iy)) + 1;
      if (ship.size < size) ship.size = size;

      ship.isVertical = ship.x === ix;
    }
  }

  let sizes = [2, 3, 3, 4, 5];
  let buff = new Array(10).fill(0).map((_) => new Array(10).fill(0));

  for (let ship of Object.values(ships)) {
    let index = sizes.indexOf(ship.size);
    if (index < 0) return false;
    sizes.splice(index, 1);

    let ex = ship.x + (ship.isVertical ? 0 : ship.size - 1);
    let ey = ship.y + (ship.isVertical ? ship.size - 1 : 0);

    for (let iy = Math.max(ship.y, 0); iy <= ey && iy < buff.length; iy++) {
      for (
        let ix = Math.max(ship.x, 0);
        ix <= ex && ix < buff[iy].length;
        ix++
      ) {
        if (buff[iy][ix]) return false;
        if (ship.x <= ix && ix <= ex && ship.y <= iy && iy <= ey)
          buff[iy][ix] = 1;
      }
    }
  }

  if (sizes.length > 0) return false;

  return Object.entries(ships).map(([key, value]) => ({
    ...value,
    value: key,
  }));
}

function onShip(event, webSocket, setShip) {
  setShip(event.value);
}

function onCell(
  { target: [i, j], player, room, ship, fleet, ownerBoard, opponentBoard },
  webSocket,
  setFleet,
  setOpponentBoard,
  setOwnerBoard,
  setShip
) {
  // Whenever someone clicks on a cell, check the players id against the rooms owner and opponent ids
  let isOwner = player.id === room.owner.player.id;

  switch (room.state) {
    case "idle":
      console.log("idle");
      break;

    case "preparation":
      const newBoard = isOwner
        ? ownerBoard.map((row) => row.slice())
        : opponentBoard.map((row) => row.slice());

      // The "< 5" means there are presently no ships on the grid cell.
      if (ship.size && newBoard[i][j] < 5) {
        newBoard[i][j] = ship.value;

        const newSize = ship.size - 1;
        const newShip = { ...ship, size: newSize };
        const newFleet = { ...fleet, [ship.name.toLowerCase()]: newShip };

        setShip(newShip);
        setFleet(newFleet);
      }

      if (isOwner) {
        setOwnerBoard(newBoard);
      } else {
        setOpponentBoard(newBoard);
      }

      break;

    case "active":
      if ((isOwner && room.isOwnerTurn) || (!isOwner && !room.isOwnerTurn)) {
        send(webSocket, "game.shoot", { x: j, y: i });
      }
      break;

    case "end":
      console.log("end");
      break;

    default:
      break;
  }
}

function onNotReady(event, webSocket) {
  send(webSocket, "game.resetships");
}

function onReady(event, webSocket) {
  // const ships = createShips(event.board);
  // @tag DEFAULT SHIPS USED FOR TESTING
  const ships = [
    {
      x: 0,
      y: 0,
      size: 2,
      isVertical: false,
      isDead: false,
      tag: 5,
    },
    {
      x: 0,
      y: 1,
      size: 3,
      isVertical: false,
      isDead: false,
      tag: 6,
    },
    {
      x: 0,
      y: 2,
      size: 3,
      isVertical: false,
      isDead: false,
      tag: 7,
    },
    {
      x: 0,
      y: 3,
      size: 4,
      isVertical: false,
      isDead: false,
      tag: 8,
    },
    {
      x: 0,
      y: 4,
      size: 5,
      isVertical: false,
      isDead: false,
      tag: 9,
    },
  ];

  if (ships) {
    send(webSocket, "game.placeships", {
      ships,
    });
  } else {
    send(webSocket, "game.resetships");
  }
}

function onSignIn(event, webSocket) {
  event.preventDefault();
  const nickname = event.target.nickname.value;
  const color = event.target.color.value;
  if (nickname.length >= 1 && nickname.length <= 32) {
    send(webSocket, "login", { nickname, color });
  }
}

function onSignOut(event, webSocket) {
  send(webSocket, "logout");
}

function onChat(event, webSocket) {
  event.preventDefault();
  const message = event.target.message.value;
  if (message.length >= 1 && message.length <= 256) {
    send(webSocket, "room.sendmessage", { message });
  }
}

function onCreate(event, webSocket) {
  send(webSocket, "room.create");
}

function onJoin(event, webSocket) {
  send(webSocket, "room.join", { roomId: event.roomId });
}

function onChallenge(event, webSocket) {
  send(webSocket, "room.challenge");
}

function onLeave(event, webSocket) {
  if (!webSocket) return;
  send(webSocket, "room.leave");
}

function onSurrender(event, webSocket) {
  send(webSocket, "game.surrender");
}

const onClickMethods = {
  onShip,
  onCell,
  onNotReady,
  onReady,
  onSignIn,
  onSignOut,
  onChat,
  onCreate,
  onJoin,
  onChallenge,
  onLeave,
  onSurrender,
};

export default onClickMethods;
