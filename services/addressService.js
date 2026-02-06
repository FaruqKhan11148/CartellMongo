const mongoose = require('mongoose');
const Address = require('../schema/addressSchema');

// GET ALL ADDRESSES FOR USER
const getUserAddresses = async (userId) => {
  try {
    const uid = new mongoose.Types.ObjectId(userId);
    const addresses = await Address.find({ user: uid }).sort({ is_default: -1 });
    return addresses;
  } catch (err) {
    console.error('getUserAddresses error:', err);
    throw err;
  }
};

// GET SINGLE ADDRESS BY ID
const getUserAddressById = async (userId, addressId) => {
  try {
    const uid = new mongoose.Types.ObjectId(userId);
    const address = await Address.findOne({ _id: addressId, user: uid });
    return address;
  } catch (err) {
    console.error('getUserAddressById error:', err);
    throw err;
  }
};

// CREATE NEW ADDRESS
const addNewAddress = async (userId, data) => {
  try {
    const uid = new mongoose.Types.ObjectId(userId);

    // If new address is default, unset previous defaults
    if (data.is_default) {
      await Address.updateMany({ user: uid }, { is_default: false });
      console.log('Cleared previous default addresses');
    }

    const newAddress = await Address.create({ ...data, user: uid });
    console.log('addNewAddress created:', newAddress);
    return newAddress;
  } catch (err) {
    console.error('addNewAddress error:', err);
    throw err;
  }
};

// UPDATE ADDRESS
const updateUserAddress = async (userId, addressId, data) => {
  try {
    const uid = new mongoose.Types.ObjectId(userId);

    // If updated address is default, unset previous defaults
    if (data.is_default) {
      await Address.updateMany({ user: uid }, { is_default: false });
      console.log('Cleared previous default addresses for update');
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId, user: uid },
      data,
      { new: true }
    );
    console.log('updateUserAddress result:', updatedAddress);
    return updatedAddress;
  } catch (err) {
    console.error('updateUserAddress error:', err);
    throw err;
  }
};

// DELETE ADDRESS
const deleteUserAddress = async (userId, addressId) => {
  try {
    const uid = new mongoose.Types.ObjectId(userId);
    const deletedAddress = await Address.findOneAndDelete({ _id: addressId, user: uid });
    console.log('deleteUserAddress deleted:', deletedAddress);
    return deletedAddress;
  } catch (err) {
    console.error('deleteUserAddress error:', err);
    throw err;
  }
};

module.exports = {
  getUserAddresses,
  getUserAddressById,
  addNewAddress,
  updateUserAddress,
  deleteUserAddress,
};
