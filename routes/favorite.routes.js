const router = require("express").Router();
const favoriteController = require("../controllers/favorite.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/", authenticate, favoriteController.addFavorite);
router.post("/toggle", authenticate, favoriteController.toggleFavorite);
router.delete("/", authenticate, favoriteController.removeFavorite);

router.get("/user/:userId", authenticate, favoriteController.getFavoritesByUser);
router.get("/check", authenticate, favoriteController.isFavorited);

module.exports = router;
