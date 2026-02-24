const prisma = require("../lib/prisma");

const createUser = async (data) => {
  return prisma.user.create({
    data,
  });
};

const getUserById = async (user_id) => {
  return prisma.user.findUnique({
    where: { user_id },
  });
};

const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const getAllUsers = async ({ skip = 0, take = 10 } = {}) => {
  return prisma.user.findMany({
    skip,
    take,
    orderBy: { created_at: "desc" },
  });
};

const countUsers = async () => {
  return prisma.user.count();
};


const updateUser = async (user_id, data) => {
  return prisma.user.update({
    where: { user_id },
    data,
  });
};

const deleteUser = async (user_id) => {
  return prisma.user.delete({
    where: { user_id },
  });
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
  countUsers
};
