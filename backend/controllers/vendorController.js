import Vendor from '../models/Vendor.js';

// Create a new vendor
export const createVendor = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vendor image is required'
      });
    }

    const vendorData = {
      ...req.body,
      image: req.file.path, // Store the file path
      createdBy: req.admin._id
    };

    console.log('Creating vendor with data:', vendorData);

    const vendor = new Vendor(vendorData);
    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating vendor',
      error: error.errors ? Object.values(error.errors).map(err => err.message) : undefined
    });
  }
};

// Get all vendors
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: error.message
    });
  }
};

// Get vendor by ID
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: error.message
    });
  }
};

// Update vendor
export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.admin._id },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: vendor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating vendor',
      error: error.message
    });
  }
};

// Delete vendor
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor',
      error: error.message
    });
  }
}; 