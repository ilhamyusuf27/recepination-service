const userService = require("../services/user.service");
const bcrypt = require("bcrypt");

const getDataUsers = async (req, res, next) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (currentPage - 1) * limit;

    const [users, total] = await Promise.all([
      userService.getAllUsers({ skip, take: limit }),
      userService.countUsers(),
    ]);

    res.status(200).json({
      success: true,
      total_data: total,
      page: currentPage,
      limit,
      result: users,
    });
  } catch (err) {
    next(err);
  }
};

const getDataById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, result: user });
  } catch (err) {
    next(err);
  }
};

const insertNewUser = async (req, res, next) => {
  try {
    const { name, phone_number, email, password, rePassword } = req.body;

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (password !== rePassword) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation does not match",
      });
    }

    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userService.createUser({
      name: name.trim(),
      phone_number: phone_number?.trim(),
      email: email.trim(),
      password: hashedPassword,
      photo_profile: req?.file?.path || null,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      result: newUser,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   UPDATE USER
========================= */
const updateUser = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    const user = await userService.getUserById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let photoUrl = user.photo_profile;

    // if (req?.file?.path) {
    //   const uploadImage = await cloudinary.uploader.upload(
    //     req.file.path,
    //     { folder: "recipe" }
    //   );
    //   photoUrl = uploadImage.secure_url;
    // }

    const updatedUser = await userService.updateUser(user_id, {
      name: req.body.name ?? user.name,
      phone_number: req.body.phone_number ?? user.phone_number,
      email: req.body.email ?? user.email,
      photo_profile: photoUrl,
    });

    res.json({
      success: true,
      message: "User updated successfully",
      result: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   DELETE USER
========================= */
const deleteUser = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    const user = await userService.getUserById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await userService.deleteUser(user_id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

/* =========================
   ROLE VALIDATION
========================= */
const userValidation = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.body.user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDataUsers,
  getDataById,
  updateUser,
  deleteUser,
  insertNewUser,
  userValidation,
};
