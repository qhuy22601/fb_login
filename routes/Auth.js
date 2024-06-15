const {
  register,
  addFriend,
  findAllFriends,
  delFriend,
  listRequests,
  findByPhoneNumber,
  updateUserInfo,
} = require("../controllers/AuthController");

const router = require("express").Router();

router.post("/register", register);
router.get("/find", findAllFriends);
router.delete("/remove", delFriend);
router.get("/list-request", listRequests)
router.post("/:userId/add/:friendId", addFriend);
router.get("/phone-check", findByPhoneNumber);
router.patch("/update", updateUserInfo);
module.exports = router;