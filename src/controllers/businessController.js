import { BusinessModel } from '../models/businessModel.js';

export const createBusiness = async (req, res) => {
  try {
    const { street, city, state, country, zip_code, ...businessData } = req.body;
    const created_by = req.user.uuid;
    const address = { street, city, state, country, zip_code };
    const businessPayload = { ...businessData, address, createdBy: created_by };
    const business = await BusinessModel.create(businessPayload);
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
    const business = await BusinessModel.findBusinessByUserId(req.user.uuid);
    if (!business) {
      return res.status(404).json({ success: false, message: 'User is not associated with any business' });
    }
    const businesses = await BusinessModel.findAllByBusinessUuid(business.uuid);
    res.status(200).json({
      success: true,
      businesses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBusinessByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const business = await BusinessModel.findByUuid(uuid);
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

export const updateBusinessByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const updated_by = req.user.uuid;
    const { street, city, state, country, zip_code, ...otherFields } = req.body;
    const fieldsToUpdate = { ...otherFields };

    if (street || city || state || country || zip_code) {
      fieldsToUpdate.address = { street, city, state, country, zip_code };
    }

    if (req.file) {
      fieldsToUpdate.logo_url = req.file.path;
    }

    const business = await BusinessModel.findByUuid(uuid);

    if (!business) {
      return res.status(200).json({ success: false, message: 'Business not found' });
    }

    await BusinessModel.update(business.uuid, fieldsToUpdate, updated_by);

    const updatedBusiness = await BusinessModel.findByUuid(business.uuid);

    res.status(200).json({
      success: true,
      message: 'Business updated successfully',
      business: updatedBusiness,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBusinessByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const business = await BusinessModel.findByUuid(uuid);
    if (!business) {
      return res.status(200).json({ success: false, message: 'Business not found' });
    }
    let result;
    if (req.hardDelete) {
      result = await BusinessModel.hardDelete(business.uuid);
    } else {
      result = await BusinessModel.delete(business.uuid, req.user.uuid);
    }
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
