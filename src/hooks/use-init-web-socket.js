import { useEffect, useState } from "react";
import Player from "../components/Player";
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

const battlebot = {
  id: 9999,
  nickname: "🤖 Battlebot",
  color: "#000000",
};

const url = "wss://battleship.kanawanagasaki.ru/ws";

function initFleet() {
  return {
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
  };
}

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

function createLog(event, index, children) {
  const id = `${event}-${index}`;
  const date = new Date().toISOString();

  return {
    id: id,
    element: (
      <span>
        <span>
          <small className="small">{`${new Date(date).toLocaleTimeString(
            ["en-GB"],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}`}</small>{" "}
          {children}
        </span>
      </span>
    ),
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
  const [fleet, setFleet] = useState(initFleet());
  const [webSocket, setWebSocket] = useState(null);

  function handleShot(event, args) {
    switch (event) {
      case "shoot":
        if (args.success) {
          if (args.isHit) {
            playSfx("hit");
            updateLogs(
              "game.shoot",
              <span>
                <Player player={args.shooter} /> fired a shot at the position{" "}
                {"{"}
                {args.x}, {gridYScale[args.y]}
                {"}"} and hit an enemy ship.
              </span>
            );
            updateLogs(
              "game.shoot",
              <span>
                <Player player={args.shooter} /> is ready to fire.
              </span>
            );
          } else {
            playSfx("miss");
            updateLogs(
              "game.shoot",
              <span>
                <Player player={args.shooter} /> fired a shot at the position{" "}
                {"{"}
                {args.x}, {gridYScale[args.y]}
                {"}"} and missed.
              </span>
            );
            updateLogs(
              "game.shoot",
              <span>
                <Player player={args.shooter} /> round ends.
              </span>
            );
          }
        } else {
          updateLogs(
            "game.shoot",
            <span>
              <Player player={battlebot} /> {args.message}. hi world????
            </span>
          );
        }
        break;
      case "onshoot":
        if (args.isHit) {
          playSfx("hit");
          updateLogs(
            "game.onshoot",
            <span>
              <Player player={args.shooter} /> fired a shot at the position{" "}
              {"{"}
              {args.x}, {gridYScale[args.y]}
              {"}"} and hit an enemy ship.
            </span>
          );
          updateLogs(
            "game.onshoot",
            <span>
              <Player player={args.shooter} /> is ready to fire.
            </span>
          );
        } else {
          playSfx("miss");
          updateLogs(
            "game.onshoot",
            <span>
              <Player player={args.shooter} /> fired a shot at the position{" "}
              {"{"}
              {args.x}, {gridYScale[args.y]}
              {"}"} and missed.
            </span>
          );
          updateLogs(
            "game.onshoot",
            <span>
              <Player player={args.shooter} /> round ends.
            </span>
          );
        }
        break;
      default:
        break;
    }
  }

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

  function updateLogs(event, children) {
    setLogs((state) => {
      const newLogs = [...state, createLog(event, state.length, children)];
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
      const data = JSON.parse(event.data);
      const { method, args } = data;

      console.log(`[🧶] MESSAGE`, { event: data });

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
            <span>
              <Player player={args.room.opponent.player} /> has issued a
              challenge against <Player player={args.room.owner.player} />
            </span>
          );
          updateLogs(
            "challenge",
            <span>
              <Player player={battlebot} />: Game is now ready. Prepare your
              warships for battle.
            </span>
          );
          break;

        case "room.onchallenge":
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
              setRoom(args.room);
              break;
            case "preparation":
              setRoom((room) => {
                if (room.state !== args.room.state) {
                  updateLogs(
                    "challenge",
                    <span>
                      <Player player={args.room.opponent.player} /> has issued a
                      challenge against{" "}
                      <Player player={args.room.owner.player} />
                    </span>
                  );
                  updateLogs(
                    "challenge",
                    <span>
                      <Player player={battlebot} />: Game is now ready. Prepare
                      your warships for battle.
                    </span>
                  );
                  updateBoards(args);
                }
                return args.room;
              });
              break;
            case "active":
              setRoom(args.room);
              break;
            case "end":
              setRoom(args.room);
              break;
            default:
              break;
          }
          break;

        /**
         * When the player is ready. Update the boards and room.
         */
        case "game.placeships":
          setRoom(args.room);
          updateBoards(args);
          break;

        /**
         * When the player hits reset. Update the boards and room.
         */
        case "game.resetships":
          setFleet((fleet) => {
            const newFleet = initFleet();
            setShip((ship) => {
              const newShip = newFleet[ship.name.toLowerCase()];
              return newShip;
            });
            return newFleet;
          });
          setRoom(args.room);
          updateBoards(args);
          break;

        /**
         * When the player shoots. Update the boards, logs, and play sfx.
         */
        case "game.shoot":
          handleShot("shoot", args);
          setRoom(args.room);
          updateBoards(args);
          break;

        /**
         * When another player shoots. Update the boards, logs and play sfx.
         */
        case "game.onshoot":
          handleShot("onshoot", args);
          setRoom(args.room);
          updateBoards(args);
          break;

        /**
         * When the game ends. Update...
         */
        case "game.ongameover":
          console.log("on game over", { args });
          updateLogs(
            "game.ongameover",
            <span>
              <Player player={battlebot} />: GAME OVER,{" "}
              <Player player={args.winner} /> has won! 🥳
            </span>
          );
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
    onReady: (event) => onClickMethods.onReady(event, webSocket),
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
