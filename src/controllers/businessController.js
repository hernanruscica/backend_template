import { BusinessModel } from '../models/businessModel.js';

export const createBusiness = async (req, res) => {
  try {
    const business = await BusinessModel.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      business,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await BusinessModel.findAll();
    res.status(200).json({
      success: true,
      businesses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await BusinessModel.findById(id);
    if (!business) {
      return res.status(200).json({ success: false, message: 'Business not found' });
    }
    res.status(200).json({
      success: true,
      business,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const fieldsToUpdate = req.body;

    if (req.file) {
      fieldsToUpdate.logo_url = req.file.path;
    }

    const business = await BusinessModel.findById(id);

    if (!business) {
      return res.status(200).json({ success: false, message: 'Business not found' });
    }

    await BusinessModel.update(id, fieldsToUpdate);

    const updatedBusiness = await BusinessModel.findById(id);

    res.status(200).json({
      success: true,
      message: 'Business updated successfully',
      business: updatedBusiness,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await BusinessModel.delete(id);
    if (result.affectedRows === 0) {
      return res.status(200).json({ success: false, message: 'Business not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Business deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
