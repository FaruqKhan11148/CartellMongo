// const Address = require('../schema/addressSchema');

// /* GET ALL ADDRESSES */
// const getAllAddresses = async (userId, callback) => {
//   try {
//     const addresses = await Address.find({ user: userId })
//       .sort({ is_default: -1 })
//       .lean();
//     callback(null, addresses);
//   } catch (err) {
//     callback(err);
//   }
// };

// /* GET SINGLE ADDRESS BY ID */
// const getAddressById = async (userId, addressId, callback) => {
//   try {
//     const address = await Address.findOne({ _id: addressId, user: userId }).lean();
//     callback(null, address ? [address] : []);
//   } catch (err) {
//     callback(err);
//     console.log(err);
//   }
// };

// /* CREATE NEW ADDRESS */
// const createAddress = async (userId, data, callback) => {
//   try {
//     const newAddress = await Address.create({ user: userId, ...data });
//     callback(null, newAddress);
//   } catch (err) {
//     callback(err);
//   }
// };

// /* CLEAR DEFAULT ADDRESS */
// const clearDefaultAddress = async (userId, callback) => {
//   try {
//     await Address.updateMany({ user: userId }, { is_default: false });
//     callback(null);
//   } catch (err) {
//     callback(err);
//   }
// };

// /* UPDATE ADDRESS */
// const updateAddress = async (userId, addressId, data, callback) => {
//   try {
//     const updatedAddress = await Address.findOneAndUpdate(
//       { _id: addressId, user: userId },
//       data,
//       { new: true }
//     );
//     callback(null, updatedAddress);
//   } catch (err) {
//     callback(err);
//   }
// };

// /* DELETE ADDRESS */
// const deleteAddress = async (userId, addressId, callback) => {
//   try {
//     await Address.deleteOne({ _id: addressId, user: userId });
//     callback(null);
//   } catch (err) {
//     callback(err);
//   }
// };

// module.exports = {
//   getAllAddresses,
//   getAddressById,
//   createAddress,
//   clearDefaultAddress,
//   updateAddress,
//   deleteAddress,
// };
