var io = require("socket.io-client");
var socket = io.connect("http://172.29.255.249:5000", { reconnect: true });

// Add a connect listener
socket.on("connect", function (socket) {
  console.log("Connected!");
});
socket.emit("CH01", "me", "test msg");