const socket = require("socket.io");

const server = app.listen(PORT, "0.0.0.0", function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
});
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
return io;