export const permissionMiddleware = async (req, res, next) => {
  /*req.user example object
    {
    uuid: 'f2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    roles: [
      {
        role: 'Administrator',
        businessUuid: '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e',
        businessName: 'Innovate LLC'
      }
    ],
    isOwner: false,
    iat: 1757288811,
    exp: 1757292411
  }*/

  // 'POST', 'GET', 'PUT', 'DELETE'
  const permissions = {
    'Administrator': {
      'businesses': ['GET', 'PUT'],
      'users': ['POST', 'GET', 'PUT', 'DELETE']
    },
    'Technician': {
      'businesses': ['GET'],
      'users': ['GET', 'PUT']
    },
    'Default': {
      'businesses': [''],
      'users': ['', '']
    }
  };

  const { user, method, baseUrl, params } = req;
  const { roles: userRoles, isOwner } = user;
  
  //console.log(req.route.path.includes('hard'));
  req.hardDelete = req.route.path.includes('hard');

  // If requester user is owner can do all.
  if (isOwner) {
    return next();
  }

  const entity = baseUrl.split('/').pop();
  const businessUuidRequested = params?.uuid || '';
  let businessUuidOrigin = '';

  if (!req.body?.uuidOrigin){
    return res.status(400).json({success: false, message: "'uuidOrigin' atribute required on body"});
  }else{
    businessUuidOrigin = req.body?.uuidOrigin;
  }  
  
  let currentRole = userRoles.find( role => role.businessUuid === businessUuidOrigin);
  if (currentRole === undefined){
    currentRole = {role: 'Default', businessUuid:''}
  }; 
  const hasRoleOnBusinnes = currentRole.role !== 'Default';
  const canGetBusiness = currentRole.businessUuid === businessUuidOrigin;  
  const userBelongsToBusiness = (entity !== 'businesses') ? hasRoleOnBusinnes : hasRoleOnBusinnes && canGetBusiness;  
  const currentPermissions = permissions[currentRole?.role][entity];
  const hasPermission = currentPermissions.includes(method);
  
  console.log('currenrole', currentRole.role)
  console.log('businessUuidRequested',businessUuidRequested);  
  console.log('entity', entity);  
  console.log('hasRoleOnBusinnes', hasRoleOnBusinnes);
  console.log('currentRole.uuid', currentRole.businessUuid);
  console.log('businessUuidOrigin', businessUuidOrigin);  
  
  console.log('canGetBusiness', canGetBusiness);  
  console.log('user belongs to bussines?', userBelongsToBusiness);

  
  //console.log(currentPermissions, hasPermission);
  
  if (!userBelongsToBusiness){
    return res.status(400).json({ success: false, message: 'User dont belongs to the business' });
  }
  
  if (hasPermission){
    return next();
   // console.log('has permission')
  }else{
    return res.status(401).json({ success: false, message: 'Forbiben' });
  }


};
