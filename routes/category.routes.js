const router = require("express").Router();
const categoryController = require("../controllers/category.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/", authenticate, categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryDetail);
router.put("/:id", authenticate, categoryController.updateCategory);
router.delete("/:id", authenticate, categoryController.deleteCategory);

module.exports = router;
