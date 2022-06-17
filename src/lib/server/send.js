function send(webSocket, method, args) {
  webSocket.send(JSON.stringify({ type: "request", method, args }));
}

export default send;
