const path = require("path");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.set("views", "./views");
app.set("io", io);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use(express.urlencoded({ extended: true }));

const rooms = {};

app.get("/", (req, res) => {
  res.render("index", { rooms });
});

app.get("/:room", (req, res) => {
  if (rooms[req.params.room] == null) rooms[req.params.room] = { users: {} };

  res.render("room", { roomName: req.params.room });
});

server.listen(3000);

io.on("connection", (socket) => {
  socket.on("send-chat-message", (room, message) => {
    socket.broadcast.to(room).emit("chat-message", {
      message,
      name: rooms[room].users[socket.id],
    });
  });

  socket.on("new-user", (room, name) => {
    socket.join(room);
    rooms[room].users[socket.id] = name;
    socket.broadcast.to(room).emit("user-connected", name);
  });

  socket.on("disconnect", () => {
    getUserRoom(socket).forEach((room) => {
      socket.broadcast
        .to(room)
        .emit("user-disconnected", rooms[room].users[socket.id]);
      delete rooms[room].users[socket.id];
    });
  });
});

function getUserRoom(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name);

    return names;
  }, []);
}
