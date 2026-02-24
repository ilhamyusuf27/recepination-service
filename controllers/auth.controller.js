const authService = require("../services/auth.service");

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    res.json({
      success: true,
      message: "Login successful",
      token: result.token,
      data: result.user,
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(
      req.body,
      req.headers.host
    );

    res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email for verification.",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.query.token);

    res.json({
      success: true,
      message: "Email successfully verified",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const newToken = await authService.refreshToken(token);

    res.json({
      success: true,
      token: newToken,
    });
  } catch (err) {
    next(err);
  }
};
