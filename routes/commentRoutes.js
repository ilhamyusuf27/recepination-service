const Router = require("express").Router();
const controller = require("../controller/commentController");
const { authenticationToken } = require("../middleware/auth.middleware");

Router.get("/all-comments", controller.showAllComment);
Router.get("/get-comment/:id", controller.getDataByRecipeId);
Router.post("/recipe/comments/:id", authenticationToken, controller.insertComment);
Router.patch("/recipe/comment/edit", authenticationToken, controller.updateComment);
Router.delete("/recipe/comment/delete", authenticationToken, controller.deleteComment);

module.exports = Router;
