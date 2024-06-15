const express = require("express");
const socket = require("socket.io");
const authRoutes = require("./routes/Auth");
const cors = require("cors");
const sequelize = require("./db/db");
const User = require("./models/AuthModel");
const UserFriend = require("./models/FriendModel");

// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, "0.0.0.0", function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
});

// Database setup
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((err) => {
    console.error("Unable to create tables, shutting down...", err);
  });

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRoutes);

User.belongsToMany(User, {
  as: "Friend1",
  foreignKey: "userId",
  through: UserFriend,
});

User.belongsToMany(User, {
  as: "Friend2",
  foreignKey: "friendId",
  through: UserFriend,
});
// Socket setup
const io = socket(server, {
  cors: {
    origin: "*",
    // origin: "http://172.29.255.251:5000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("register", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID: ${socket.id}`);
  });

  // Handle sending friend requests
  socket.on("send-friend-request", async ({ senderId, receiverId }) => {
    try {
      await UserFriend.create({
        userId: senderId,
        friendId: receiverId,
        isFriend: false,
        isUserRequested: true,
      });
      console.log("senderId _ receiverId", senderId, receiverId);
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("friend-request", { senderId });
      }
    } catch (error) {
      socket.emit("error", error.message);
    }
  });

  // Handle accepting friend requests
  socket.on("accept-friend-request", async ({ receiverId, senderId }) => {
    try {
      const friendRequest = await UserFriend.findOne({
        where: { userId: senderId, FriendId: receiverId },
      });
      if (friendRequest) {
        friendRequest.isFriend = true;
        friendRequest.isUserRequested = true;
        await friendRequest.save();
        await UserFriend.create({
          userId: receiverId,
          friendId: senderId,
          isFriend: true,
          isUserRequested: true,
        });

        const senderSocketId = userSockets.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("friend-accepted", { receiverId });
        }
      } else {
        socket.emit("error", "Friend request not found");
      }
    } catch (error) {
      socket.emit("error", error.message);
    }
  });

  // Handle find friend
  socket.on("find-friend", async ({ phoneNumber, userId }) => {
    try {
      const findingNemo = await User.findOne({
        where: { phoneNumber: phoneNumber },
        // attributes: ["id"],
      });
      // console.log(findingNemo);
      let role = "Unknown";
   

      if (findingNemo) {
        const friendId = findingNemo.dataValues.id;
        // console.log(friendId);
        const friendShip = await UserFriend.findOne({
          where: { userId: userId, friendId: friendId },
        });

        if (friendShip) {
          if (friendShip.isFriend) {
            role = "Friend";
            const res = {
              ...findingNemo.dataValues,
              friendId: friendId,
              role: role,
            };
            // socket.emit("check-friend", findingNemo.dataValues, friendId, "friend");
            socket.emit("check-friend", res);
          } else if (friendShip.isUserRequested) {
            role = "Requested";
            const res = {
              ...findingNemo.dataValues,
              friendId: friendId,
              role: role,
            };
            // socket.emit("check-friend", findingNemo.dataValues, friendId, "Requested");
            socket.emit("check-friend", res);
          } else {
            role = "Unknow";
            const res = {
              ...findingNemo.dataValues,
              friendId: friendId,
              role: role,
            };
            socket.emit("check-friend", res);
          }
        } else {
          const reverseFriendship = await UserFriend.findOne({
            where: { userId: friendId, friendId: userId },
          });

          if (reverseFriendship) {
            if (reverseFriendship.isFriend) {
              role = "Friend";
              const res = {
                ...findingNemo.dataValues,
                friendId: friendId,
                role: role,
              };
              // socket.emit("check-friend", findingNemo.dataValues, friendId, "friend");
              socket.emit("check-friend", res);
            } else if (reverseFriendship.isUserRequested) {
              role = "Accepted";
              const res = {
                ...findingNemo.dataValues,
                friendId: friendId,
                role: role,
              };
              // socket.emit("check-friend", findingNemo.dataValues, friendId, "Accepted");
              socket.emit("check-friend", res);
            } else {
              role = "Unknow";
               const res = {
                 ...findingNemo.dataValues,
                 friendId: friendId,
                 role: role,
               };
              socket.emit("check-friend", res);
            }
          } else {
            role = "Unknow";
            const res = {
              ...findingNemo.dataValues,
              friendId: friendId,
              role: role,
            };
            socket.emit("check-friend", res);
          }
        }
      } else {
        socket.emit("error", "User not found");
      }
    } catch (error) {
      socket.emit("error", error.message);
    }
  });

  // Handle tracking
  socket.on("tracking", async ({ userId, userName, locationX, locationY }) => {
    ///////////////add userName
    try {
      await User.update({ locationX, locationY }, { where: { id: userId } });

      // console.log("dsadqdqwtest: + + " + userId + userName, locationX, locationY)

      const friendIds = await getFriendsList(userId);
      friendIds.forEach((friendId) => {
        const friendSocketId = userSockets.get(friendId);
        if (friendSocketId) {
          io.to(friendSocketId).emit("location-update", {
            userId,
            userName,
            locationX,
            locationY,
          });
        }
      });
    } catch (error) {
      // console.log("erorr:         "    + error.message);
      socket.emit("error", error.message);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

const getFriendsList = async (currentUserId) => {
  try {
    const friends = await UserFriend.findAll({
      where: {
        userId: currentUserId,
        isFriend: true,
      },
      attributes: ["FriendId"],
    });
    return friends.map((friend) => friend.FriendId);
  } catch (error) {
    console.error("Error fetching friends:", error);
    throw error;
  }
};
