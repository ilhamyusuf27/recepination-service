const router = require("express").Router();
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/", authenticate, userController.getDataUsers);
router.get("/:id", authenticate, userController.getDataById);
router.post("/", userController.insertNewUser);
router.put("/:id", authenticate, userController.updateUser);
router.delete("/:id", authenticate, userController.deleteUser);

module.exports = router;
