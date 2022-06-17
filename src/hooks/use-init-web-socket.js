import { useEffect, useState } from "react";
import onClickMethods from "../lib/events/on-click-methods";
import send from "../lib/server/send";

const url = "wss://battleship.kanawanagasaki.ru/ws";

const useInitWebSocket = () => {
  // Stores message data.
  const [chat, setChat] = useState([]);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  // Player is the currently signed in client.
  const [player, setPlayer] = useState(null);

  // Room is the room the player is currenly in.
  const [room, setRoom] = useState(null);

  // A list of all available rooms to join.
  const [rooms, setRooms] = useState([]);

  // Handles the owner and opponent board values.
  const [ownerBoard, setOwnerBoard] = useState(null);
  const [opponentBoard, setOpponentBoard] = useState(null);

  // The ship is the currently selected ship for placement.
  const [ship, setShip] = useState(null);

  // The Toolbar component handles fleet placement during the preparation phase.
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

  /**
   * Takes webSocket args and starts the initializes the boards for owner and opponent clients.
   *
   * @param {*} args
   */
  function startGame(args) {
    setLogs((state) => [
      ...state,
      {
        id: `preparation-${state.length}`,
        player: { id: 0, nickname: "New Log" },
        message: `Game has begun. ${args.room.owner.player.nickname} vs. ${args.room.opponent.player.nickname}`,
      },
    ]);

    const newOpponentBoard = args.room.opponent.board.map((row) => row.slice());
    const newOwnerBoard = args.room.owner.board.map((row) => row.slice());

    setOpponentBoard(newOpponentBoard);
    setOwnerBoard(newOwnerBoard);
  }

  useEffect(function initWebSocket() {
    const newWebSocket = new WebSocket(url);

    newWebSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { method, args } = data;

      console.log({ data });

      if (!args.success) {
        setError(args.message);
      } else {
        setError(null);
      }

      switch (method) {
        case "room.sendmessage":
          setChat((state) => [...state, args.chatMessage]);
          break;
        case "room.onmessage":
          setChat((state) => [...state, args.chatMessage]);
          break;
        case "room.oncreate":
          setRooms((state) => [...state, args.room]);
          break;
        case "room.list":
          setRooms(args.rooms);
          break;
        case "room.create":
          setRoom(args.room);
          break;
        case "room.ondestroy":
          send(newWebSocket, "room.list");
          break;
        case "room.challenge":
          startGame(args);
          setRoom(args.room);
          break;

        case "room.onleave":
          setRoom((state) => ({
            ...state,
            viewers: state.viewers.filter(
              (viewer) => viewer.id !== args.player.id
            ),
          }));
          break;

        case "room.onkick":
          setRoom(null);
          break;

        case "room.leave":
          setRoom(null);
          send(newWebSocket, "room.list");
          break;
        /**
         * Whenever you join a room.
         */
        case "room.join":
          setChat(args.room.messages);
          setRoom(args.room);
          setOwnerBoard(args.room.owner.board.map((row) => row.slice()));
          if (args.room.opponent) {
            setOpponentBoard(
              args.room.opponent.board.map((row) => row.slice())
            );
          }
          break;

        case "game.placeships":
          startGame(args);
          setRoom(args.room);
          break;

        /**
         * Whenever another client joins a room you are in.
         */
        case "room.onjoin":
          setRoom(args.room);
          break;
        /**
         * Host is joined by a challenger.
         */
        case "room.onstatechange":
          switch (args.room.state) {
            case "idle":
              setOpponentBoard(null);
              break;
            case "preparation":
              if (!args.room.owner.isReady && !args.room.opponent.isReady) {
                startGame(args);
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
        case "logout":
          setPlayer(null);
          setRoom(null);
          setRooms([]);
          break;
        case "login":
          setPlayer(args.player);
          send(newWebSocket, "room.list");
          break;

        default:
          break;
      }
    };

    newWebSocket.onerror = (event) => {
      console.log(`[💥] ERROR :\n`, event);
    };

    newWebSocket.onopen = (event) => {
      console.log("[🎉] OPEN :\n", event);
      newWebSocket.send(JSON.stringify({ type: "request", method: "methods" }));
    };

    newWebSocket.onclose = (event) => {
      console.log(`[🧨] CLOSE :\n`, event);
    };

    setWebSocket(newWebSocket);

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
