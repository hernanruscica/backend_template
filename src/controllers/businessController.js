import { BusinessModel } from '../models/businessModel.js';
import { getAllBusinessesService, updateBusinessByUuidService } from '../services/businessService.js';
import catchAsync from '../utils/catchAsync.js';

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

export const getAllBusinesses = catchAsync(async (req, res) => {
  const { user } = req;  
    const businesses = await getAllBusinessesService(user);
    return res.status(200).json({
      success:true,
      count: businesses.length,
      businesses,                
    }); 
});

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

export const updateBusinessByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  //console.log(req.body)
  const updatedBusiness = await updateBusinessByUuidService(uuid, req.body, req.user.uuid, req.file);
  res.status(200).json({
    success: true,
    message: 'Business updated successfully',
    business: updatedBusiness,
  });
});

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
      message: `Business ${(req.hardDelete)?'permanently':''} deleted successfull`,
      business: {...business, is_active: false},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
