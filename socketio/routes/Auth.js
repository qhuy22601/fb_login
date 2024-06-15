const {
  register,
  addFriend,
  findAllFriends,
  delFriend,
  listRequests,
  findByPhoneNumber,
  listAccept,
  updateUserInfo,
} = require("../controllers/AuthController");

const router = require("express").Router();

router.post("/register", register);
router.get("/find/:userId", findAllFriends);
router.delete("/remove", delFriend);
router.get("/list-request/:userId", listRequests);
router.post("/:userId/add/:friendId", addFriend);
router.get("/phone-check/:phoneNumber", findByPhoneNumber);
router.patch("/update", updateUserInfo);
router.get("/list-accept/:userId", listAccept);
module.exports = router;