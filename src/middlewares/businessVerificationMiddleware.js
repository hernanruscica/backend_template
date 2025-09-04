import CustomError from '../utils/customError.js';
import catchAsync from '../utils/catchAsync.js';
import { UserModel } from '../models/userModel.js';
import { BusinessModel } from '../models/businessModel.js';
import { RoleModel } from '../models/roleModel.js';

export const verifySameBusiness = (action) => catchAsync(async (req, res, next) => {
  const { uuid } = req.params; // uuid of the user to be affected

  const requester = await UserModel.findByUuid(req.user.uuid);
  const userToAffect = await UserModel.findByUuid(uuid);

  if (!userToAffect) {
    throw new CustomError('User not found', 404);
  }   

  // Assuming a user belongs to only one business for this check, or we take the first one.
  // If a user can belong to multiple businesses, this logic needs to be refined.
  const requesterBusinessUuid = requester.businesses_roles[0]?.business_uuid;
  const userToAffectBusinessUuid = userToAffect.businesses_roles[0]?.business_uuid;

  if (requesterBusinessUuid !== userToAffectBusinessUuid) {
    throw new CustomError(`You can only ${action} users within your own business.`, 403);
  }else if(requester.businesses_roles[0].role == 'Administrator' && action == 'hard_delete'){    
    //From the same business and the actio is to Hard delete
    req.hardDelete = true; 
  }

  next();
});

export const verifyBusinessAccess = (requiredRole) => catchAsync(async (req, res, next) => {
  const { uuid: businessUuid } = req.params;

  const requester = await UserModel.findByUuid(req.user.uuid);

  if (!requester) {
    throw new CustomError('Requester user not found', 404);
  }

  let hasAccess = false;
  let isAdministrator = false;

  for (const businessRole of requester.businesses_roles) {
    if (businessRole.business_uuid === businessUuid) {
      hasAccess = true;
      const role = await RoleModel.findByPk(businessRole.role_uuid);
      if (role && role.name === 'Administrator') {
        isAdministrator = true;
      }
      break;
    }
  }

  if (!hasAccess) {
    throw new CustomError('You do not have access to this business.', 403);
  }

  if (requiredRole === 'Administrator' && !isAdministrator) {
    throw new CustomError('You do not have administrative privileges for this business.', 403);
  }

  next();
});
