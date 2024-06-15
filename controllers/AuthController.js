const User = require("../models/AuthModel");
const Friend = require("../models/FriendModel");


module.exports.register = async (req, res, next) => {
  try {
    const { phoneNumber, userName, locationX, locationY } = req.body;
    const phoneCheck = await User.findOne({where: {phoneNumber} });
    if (phoneCheck)
      return res.json({ msg: "Phone number already used", status: false });
    const user = await User.create({
      phoneNumber,
      userName,
      locationX,
      locationY,
    });
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.findAllFriends = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const allFriends = await Friend.findAll({
      where: { userId: userId, isFriend: true },
    });

    const friendIds = allFriends.map((friend) => friend.dataValues.friendId);
    const listFriend = await Promise.all(
      friendIds.map((id) => User.findOne({ where: { id } }))
    );

    return res.json({ status: true, listFriend });
  } catch (ex) {
    next(ex);
  }
};

module.exports.listRequests = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const allFriends = await Friend.findAll({
      where: { userId: userId, isFriend: false },
    });
    const friendIds = allFriends.map((friend) => friend.data.friendId);
    const listFriend = await Promise.all();
    friendIds.map((id) => User.findOne({ where: { id } }));
    return res.json({ status: true, listFriend });
  } catch (ex) {
    next(ex);
  }
};

module.exports.updateUserInfo = async (req, res, next) => {
  try {
    const { userId, userName, phoneNumber } = req.body;
    console.log(phoneNumber, userName, userId)
    const info = await User.findOne({
      where: { id: userId },
    });
    if(!info){
    console.log("///////////info///////////error//////////////////" );
    }
    else{
    console.log("///////////info///////////" + info.dataValues + info);
    info.userName = userName
    info.phoneNumber = phoneNumber
    await info.save();
   
    return res.json({ status: true, info });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.delFriend = async (req, res, next) => {
  try{
    const {currentId, friendId} = req.body;
    Friend.destroy({ where: { userId: currentId, friendId: friendId } });
    Friend.destroy({ where: { userId: friendId, friendId: currentId } });
    return res.json({status: true});
  } catch(ex){
    next(ex);
  }
}

module.exports.findByPhoneNumber = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const existed = User.findOne({where: {phoneNumber: phoneNumber}});
    if(existed){
      return res.json({status: false});
    }
    return res.json({ status: true });
  } catch (ex) {
    next(ex);
  }0
};

module.exports.addFriend = async(req, res) =>{
  try {
    const { userId, friendId } = req.params;
    const user = await User.findByPk(userId);
    const friend = await User.findByPk(friendId);
    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }
    await user.addFriend(friend);

    // Send response only, as the notification is sent via Socket.IO
    res.status(200).json({ message: "Friend added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}