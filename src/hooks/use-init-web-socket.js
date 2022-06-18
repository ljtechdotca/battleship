import { useEffect, useState } from "react";
import onClickMethods from "../lib/events/on-click-methods";
import send from "../lib/server/send";

const gridYScale = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
  4: "E",
  5: "F",
  6: "G",
  7: "H",
  8: "I",
  9: "J",
};

const gridXScale = {
  0: 9,
  1: 8,
  2: 7,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
  9: 0,
};

const url = "wss://battleship.kanawanagasaki.ru/ws";

function playSfx(event) {
  let url = "";
  switch (event) {
    case "hit":
      url =
        "https://assets.mixkit.co/sfx/download/mixkit-sea-mine-explosion-1184.wav";
      break;

    case "miss":
      url =
        "https://cdn.pixabay.com/download/audio/2021/08/04/audio_65623c4693.mp3?filename=splash-by-blaukreuz-6261.mp3";
      break;

    case "won":
      url =
        "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=success-fanfare-trumpets-6185.mp3";
      break;

    case "lose":
      url =
        "https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3?filename=negative_beeps-6008.mp3";
      break;
    default:
      break;
  }

  const sfx = new Audio(url);
  sfx.volume = 0.1;
  sfx.play();
}

function createLog(
  event,
  index,
  message,
  player = { id: 9999, nickname: "🔴 SYSTEM" }
) {
  return {
    id: `${event}-${index}`,
    datetime: new Date().toISOString(),
    player: player,
    message: message,
  };
}

const useInitWebSocket = () => {
  const [chat, setChat] = useState([]);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [ownerBoard, setOwnerBoard] = useState(null);
  const [opponentBoard, setOpponentBoard] = useState(null);
  const [ship, setShip] = useState(null);
  const [fleet, setFleet] = useState({
    destroyer: {
      name: "Destroyer",
      size: 2,
      value: 5,
    },
    cruiser: {
      name: "Cruiser",
      size: 3,
      value: 6,
    },
    submarine: {
      name: "Submarine",
      size: 3,
      value: 7,
    },
    battleship: {
      name: "Battleship",
      size: 4,
      value: 8,
    },
    carrier: {
      name: "Carrier",
      size: 5,
      value: 9,
    },
  });
  const [webSocket, setWebSocket] = useState(null);

  function updateBoards(args) {
    if (args.room.opponent) {
      const newOpponentBoard = args.room.opponent.board.map((row) =>
        row.slice()
      );
      setOpponentBoard(newOpponentBoard);
    }

    const newOwnerBoard = args.room.owner.board.map((row) => row.slice());
    setOwnerBoard(newOwnerBoard);
  }

  function updateChat(args) {
    setChat((state) => {
      const newChat = [...state, args.chatMessage];
      while (newChat.length > 40) newChat.shift();
      return newChat;
    });
  }

  function updateLogs(event, message, player) {
    setLogs((state) => {
      const newLogs = [
        ...state,
        createLog(event, state.length, message, player),
      ];
      while (newLogs.length > 40) newLogs.shift();
      return newLogs;
    });
  }

  /**
   * Init the web socket with onmessage, onerror, onopen and onclose functions.
   */
  useEffect(function initWebSocket() {
    const newWebSocket = new WebSocket(url);

    newWebSocket.onmessage = (event) => {
      console.log(`[🧶] MESSAGE`, event);

      const data = JSON.parse(event.data);
      const { method, args } = data;

      switch (method) {
        /**
         * When the player logs out. Update the logs, player, room, and rooms.
         */
        case "logout":
          setLogs([]);
          setPlayer(null);
          setRoom(null);
          setRooms([]);
          break;

        /**
         * When the play logs in. Update the error and player.
         */
        case "login":
          if (!args.success) {
            setError(args.message);
          } else {
            send(newWebSocket, "room.list");
            setError(null);
            setPlayer(args.player);
          }
          break;

        /**
         * When the player sends a message. Update the chat.
         */
        case "room.sendmessage":
          updateChat(args);
          break;

        /**
         * When another player sends a message. Update the chat.
         */
        case "room.onmessage":
          updateChat(args);
          break;

        /**
         * When another player creates a room. Update the rooms.
         */
        case "room.oncreate":
          setRooms((state) => [...state, args.room]);
          break;

        /**
         * When the rooms list is called. Update the rooms.
         */
        case "room.list":
          setRooms(args.rooms);
          break;

        /**
         * When the player creates a room. Update the room.
         */
        case "room.create":
          setRoom(args.room);
          break;

        /**
         * When another players room is destroyed. Update the rooms.
         */
        case "room.ondestroy":
          send(newWebSocket, "room.list");
          break;

        /**
         * When the player challenges the owner. Update the board, logs, and room.
         */
        case "room.challenge":
          setRoom(args.room);
          updateBoards(args);
          updateLogs(
            "challenge",
            `has issued a challenge against ${args.room.owner.player.nickname}.`,
            args.room.opponent.player
          );
          updateLogs(
            "challenge",
            `Entering preparation state. Please setup your ships.`
          );
          break;

        /**
         * When another player leaves the room. Update the room viewers.
         */
        case "room.onleave":
          setRoom((state) => ({
            ...state,
            viewers: state.viewers.filter(
              (viewer) => viewer.id !== args.player.id
            ),
          }));
          break;

        /**
         * When the player has been kicked. Update the chat, logs, room, and rooms.
         */
        case "room.onkick":
          setChat([]);
          setLogs([]);
          setRoom(null);
          send(newWebSocket, "room.list");
          break;

        /**
         * When the player leaves a room. Update the chat, logs, and room.
         */
        case "room.leave":
          setChat([]);
          setLogs([]);
          setRoom(null);
          send(newWebSocket, "room.list");
          break;

        /**
         * Whenever the player joins a room. Update the boards, chat, and room.
         */
        case "room.join":
          setChat(args.room.messages);
          setRoom(args.room);
          updateBoards(args);
          break;

        /**
         * When another player joins the room. Update the room.
         */
        case "room.onjoin":
          setRoom(args.room);
          break;

        /**
         * When the room state changes to idle, preparation, active or end.
         */
        case "room.onstatechange":
          switch (args.room.state) {
            case "idle":
              setOpponentBoard(null);
              break;
            case "preparation":
              if (!args.room.owner.isReady && !args.room.opponent.isReady) {
                updateLogs(
                  "challenge",
                  `has issued a challenge against ${args.room.owner.player.nickname}.`,
                  args.room.opponent.player
                );
                updateLogs(
                  "challenge",
                  `Entering preparation state. Please setup your ships.`
                );
                updateBoards(args);
              }
              break;
            case "active":
              break;
            case "end":
              break;
            default:
              break;
          }
          setRoom(args.room);
          break;

        /**
         * When the player is ready. Update the boards and room.
         */
        case "game.placeships":
          setRoom(args.room);
          updateBoards(args);
          break;

        /**
         * When the player shoots. Update the boards, logs, and play sfx.
         */
        case "game.shoot":
          if (args.success) {
            if (args.isHit) {
              playSfx("hit");
              updateLogs(
                "game.shoot",
                `You fired a shot at the position {${args.x}, ${
                  gridYScale[args.y]
                }} and hit, you shoot again`,
                args.shooter
              );
              updateLogs("game.onshoot", `Is firing again...`, args.shooter);
            } else {
              playSfx("miss");
              updateLogs(
                "game.shoot",
                `You fired a shot at the position {${args.x}, ${
                  gridYScale[args.y]
                }} and missed.`,
                args.shooter
              );
              updateLogs("game.onshoot", `Is done firing...`, args.shooter);
            }
            updateBoards(args);
          } else {
            updateLogs("game.shoot", args.message);
          }
          break;

        /**
         * When another player shoots. Update the boards, logs and play sfx.
         */
        case "game.onshoot":
          if (args.isHit) {
            playSfx("hit");
            updateLogs(
              "game.onshoot",
              `Just fired a shot {${args.x}, ${gridYScale[args.y]}} and hit.`,
              args.shooter
            );
            updateLogs("game.onshoot", `Is firing again...`, args.shooter);
          } else {
            playSfx("miss");
            updateLogs(
              "game.onshoot",
              `Just fired a shot {${args.x}, ${
                gridYScale[args.y]
              }} and missed.`,
              args.shooter
            );
            updateLogs("game.onshoot", `Is done firing...`, args.shooter);
          }
          setRoom(args.room);
          updateBoards(args);
          break;

        /**
         * When the game ends. Update...
         */
        case "game.ongameover":
          updateLogs("game.ongameover", `The game has ended`);
          setPlayer((state) => {
            if (state.id === args.winner.id) {
              playSfx("won");
            }
            if (state.id !== args.winner.id) {
              playSfx("lose");
            }
            return state;
          });
          break;

        default:
          break;
      }
    };

    newWebSocket.onerror = (event) => {
      console.log(`[🔥] ERROR :\n`, event);
    };

    newWebSocket.onopen = (event) => {
      console.log("[🎉] OPEN :\n", event);
    };

    newWebSocket.onclose = (event) => {
      console.log(`[🧨] CLOSE :\n`, event);
    };

    setWebSocket(newWebSocket);
  }, []);

  const onClick = {
    onShip: (event) => onClickMethods.onShip(event, webSocket, setShip),
    onCell: (event) =>
      onClickMethods.onCell(
        event,
        webSocket,
        setFleet,
        setOpponentBoard,
        setOwnerBoard,
        setShip
      ),
    onNotReady: (event) => onClickMethods.onNotReady(event, webSocket),
    onReady: (event) =>
      onClickMethods.onReady(
        event,
        webSocket,
        setError,
        setFleet,
        setOpponentBoard,
        setOwnerBoard
      ),
    onSignIn: (event) => onClickMethods.onSignIn(event, webSocket),
    onSignOut: (event) => onClickMethods.onSignOut(event, webSocket),
    onChat: (event) => onClickMethods.onChat(event, webSocket),
    onCreate: (event) => onClickMethods.onCreate(event, webSocket),
    onJoin: (event) => onClickMethods.onJoin(event, webSocket),
    onChallenge: (event) => onClickMethods.onChallenge(event, webSocket),
    onLeave: (event) => onClickMethods.onLeave(event, webSocket),
    onSurrender: (event) => onClickMethods.onSurrender(event, webSocket),
  };

  return {
    chat,
    error,
    logs,
    player,
    room,
    rooms,
    ownerBoard,
    opponentBoard,
    ship,
    fleet,
    onClick,
  };
};

export default useInitWebSocket;
