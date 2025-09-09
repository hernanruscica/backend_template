import {
  getAllBusinessesService,
  updateBusinessByUuidService,
  deleteBusinessByUuidService,
  hardDeleteBusinessByUuidService
} from '../services/businessService.js';
import catchAsync from '../utils/catchAsync.js';
import CustomError from '../utils/customError.js';

export const createBusiness = catchAsync(async (req, res, next) => {
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
});

export const getAllBusinesses = catchAsync(async (req, res) => {
  const { user } = req;
  const businesses = await getAllBusinessesService(user);
  return res.status(200).json({
    success: true,
    count: businesses.length,
    businesses,
  });
});

export const getBusinessByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  const business = await BusinessModel.findByUuid(uuid);
  if (!business) {
    return next(new CustomError('Business not found', 404));
  }
  res.status(200).json({
    success: true,
    business,
  });
});

export const updateBusinessByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  const updatedBusiness = await updateBusinessByUuidService(uuid, req.body, req.user.uuid, req.file);
  res.status(200).json({
    success: true,
    message: 'Business updated successfully',
    business: updatedBusiness,
  });
});

export const deleteBusinessByUuid = catchAsync(async (req, res, next) => {
  const { uuid } = req.params;
  let response;
  if (req.hardDelete) {
    response = await hardDeleteBusinessByUuidService(uuid);
  } else {
    response = await deleteBusinessByUuidService(uuid, req.user.uuid);
  }
  res.status(200).json({
    success: true,
    message: response.message,
    business: response.business,
  });
});
