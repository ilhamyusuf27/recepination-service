const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../lib/mailer");
const AppError = require("../utils/AppError");


const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const err = new AppError("Invalid email or password");
    err.status = 401;
    throw err;
  }

  if (!user.is_verified) {
    const err = new AppError("Please verify your email first");
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const err = new AppError("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const payload = {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "30m",
  });

  return {
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      photo_profile: user.photo_profile,
    },
  };
};

const register = async (data, host) => {
  const { name, phone_number, email, password, rePassword } = data;

  if (password.length < 8) {
    const err = new AppError("Password must be at least 8 characters");
    err.status = 400;
    throw err;
  }

  if (password !== rePassword) {
    const err = new AppError("Password confirmation does not match");
    err.status = 400;
    throw err;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const err = new AppError("Email already exists");
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const email_token = crypto.randomBytes(32).toString("hex");

  const {password: _, ...user} = await prisma.user.create({
    data: {
      name: name.trim(),
      phone_number: phone_number?.trim(),
      email: email.trim(),
      password: hashedPassword,
      email_token,
    },
  });

  // Send verification email
//   await sendVerificationEmail({
//   name: user.name,
//   email: user.email,
//   token: email_token,
// });

  return user;
};

const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: { email_token: token },
  });

  if (!user) {
    const err = new AppError("Invalid or expired token");
    err.status = 400;
    throw err;
  }

  return prisma.user.update({
    where: { user_id: user.user_id },
    data: {
      email_token: null,
      is_verified: true,
    },
  });
};

const refreshToken = async (oldToken) => {
  if (!oldToken) {
    const err = new AppError("Token required");
    err.status = 403;
    throw err;
  }

  let decoded;

  try {
    decoded = jwt.verify(oldToken, process.env.SECRET_KEY);
  } catch(error) {
    const err = new AppError("Invalid token");
    err.status = 401;
    throw err;
  }

  const newToken = jwt.sign(
    {
      user_id: decoded.user_id,
      name: decoded.name,
      email: decoded.email,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );

  return newToken;
};

module.exports = {
  login,
  register,
  verifyEmail,
  refreshToken,
};
