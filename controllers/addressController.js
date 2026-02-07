// const addressService = require('../services/addressService');

// // PAGE: SELECT ADDRESS
// const checkoutAddressPage = async (req, res) => {
//   try {
//     const { productId } = req.query;
//     const addresses = await addressService.getUserAddresses(req.user._id);

//     res.render('pages/selectAddress', {
//       addresses,
//       productId,
//     });
//   } catch (err) {
//     res.status(500).send('Server Error');
//   }
// };

// // PAGE: ADD ADDRESS FORM
// const addAddressPage = (req, res) => {
//   res.render('pages/addAddress');
// };

// // PAGE: EDIT ADDRESS FORM
// const editAddressPage = async (req, res) => {
//   try {
//     const address = await addressService.getUserAddressById(
//       req.user._id,
//       req.params.id,
//     );

//     if (!address) return res.redirect('/api/addresses');

//     res.render('pages/editAddress', { address });
//   } catch (err) {
//     res.redirect('/api/addresses');
//   }
// };

// // ACTION: CREATE ADDRESS
// const createAddress = async (req, res) => {
//   try {
//     await addressService.addNewAddress(req.user._id, req.body);
//     res.redirect('/api/addresses');
//   } catch (err) {
//     res.status(500).send('Server Error');
//   }
// };

// // ACTION: UPDATE ADDRESS
// const updateAddress = async (req, res) => {
//   try {
//     await addressService.updateUserAddress(
//       req.user._id,
//       req.params.id,
//       req.body,
//     );
//     res.redirect('/api/addresses');
//   } catch (err) {
//     res.status(500).send('Server Error');
//   }
// };

// // ACTION: DELETE ADDRESS
// const deleteAddress = async (req, res) => {
//   try {
//     await addressService.deleteUserAddress(req.user._id, req.params.id);
//     res.json({ success: true, message: 'Address deleted' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

// module.exports = {
//   checkoutAddressPage,
//   addAddressPage,
//   editAddressPage,
//   createAddress,
//   updateAddress,
//   deleteAddress,
// };


const addressService = require('../services/addressService');

// PAGE: SELECT ADDRESS
const checkoutAddressPage = async (req, res) => {
  try {
    const { productId } = req.query;
    const addresses = await addressService.getUserAddresses(req.user._id);

    res.render('pages/selectAddress', { addresses, productId });
  } catch (err) {
    console.error('checkoutAddressPage error:', err);
    res.status(500).send('Server Error');
  }
};

// PAGE: ADD ADDRESS FORM
const addAddressPage = (req, res) => {
  res.render('pages/addAddress');
};

// PAGE: EDIT ADDRESS FORM
const editAddressPage = async (req, res) => {
  try {
    console.log('editAddressPage called for id:', req.params.id);
    const address = await addressService.getUserAddressById(req.user._id, req.params.id);

    if (!address) {
      console.warn('Address not found');
      return res.redirect('/api/addresses');
    }

    res.render('pages/editAddress', { address });
  } catch (err) {
    console.error('editAddressPage error:', err);
    res.redirect('/api/addresses');
  }
};

// ACTION: CREATE ADDRESS
const createAddress = async (req, res) => {
  try {
    console.log('createAddress called with:', req.body);
    await addressService.addNewAddress(req.user._id, req.body);
    res.redirect('/api/addresses');
  } catch (err) {
    console.error('createAddress error:', err);
    res.status(500).send('Server Error');
  }
};

// ACTION: UPDATE ADDRESS
const updateAddress = async (req, res) => {
  try {
    console.log('updateAddress called with id:', req.params.id, req.body);
    await addressService.updateUserAddress(req.user._id, req.params.id, req.body);
    res.redirect('/api/addresses');
  } catch (err) {
    console.error('updateAddress error:', err);
    res.status(500).send('Server Error');
  }
};

// ACTION: DELETE ADDRESS
const deleteAddress = async (req, res) => {
  try {
    console.log('deleteAddress called with id:', req.params.id);
    await addressService.deleteUserAddress(req.user._id, req.params.id);
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    console.error('deleteAddress error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  checkoutAddressPage,
  addAddressPage,
  editAddressPage,
  createAddress,
  updateAddress,
  deleteAddress,
};
