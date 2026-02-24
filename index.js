require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const errorHandler = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const recipeRoutes = require("./routes/recipe.routes");
const ingredientRoutes = require("./routes/ingredients.routes");
const categoryRoutes = require("./routes/category.routes");
const recipeCategoryRoutes = require("./routes/recipeCategory.routes");
const commentRoutes = require("./routes/comment.routes");
const favoriteRoutes = require("./routes/favorite.routes");

const app = express();
const port = process.env.PORT || 8000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images/recipes", express.static("images/recipes"));
app.use("/images/users", express.static("images/users"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/recipes", recipeRoutes);
app.use("/api/v1/ingredients", ingredientRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/recipe-categories", recipeCategoryRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/favorites", favoriteRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
