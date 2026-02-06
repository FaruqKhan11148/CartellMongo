const User = require("../schema/userSchema");

/* CREATE USER */
const createUser = async (user, callback) => {
  try {
    const newUser = await User.create(user);
    callback(null, newUser);
  } catch (err) {
    callback(err);
  }
};

/* FIND BY EMAIL */
const findUserByEmail = async (email, callback) => {
  try {
    const user = await User.findOne({ email });
    callback(null, user ? [user] : []);
  } catch (err) {
    callback(err);
  }
};

/* GET USER BY ID */
const getUserById = async (userId, callback) => {
  try {
    const user = await User.findById(userId).select(
      '_id email name createdAt'
    );
    callback(null, user ? [user] : []);
  } catch (err) {
    callback(err);
  }
};

/* UPDATE PROFILE */
const updateUserProfile = async (userId, name, email, callback) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    );
    callback(null, updatedUser);
  } catch (err) {
    callback(err);
  }
};

/* GET PASSWORD */
const getUserPasswordById = async (userId, callback) => {
  try {
    const user = await User.findById(userId).select('password');
    callback(null, user ? [{ password: user.password }] : []);
  } catch (err) {
    callback(err);
  }
};

/* UPDATE PASSWORD */
const updateUserPassword = async (userId, hashedPassword, callback) => {
  try {
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    callback(null);
  } catch (err) {
    callback(err);
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  getUserById,
  updateUserProfile,
  getUserPasswordById,
  updateUserPassword,
};
