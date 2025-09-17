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
      'users': ['POST', 'GET', 'PUT', 'DELETE'],      
      'dataloggers': ['POST', 'GET', 'PUT', 'DELETE'],
    },
    'Technician': {
      'businesses': ['GET'],
      'users': ['GET', 'PUT'],      
      'dataloggers': ['GET'],
    },
    'Default': {
      'businesses': [''],
      'users': ['', ''],
      'dataloggers': ['', '', '', '']
    }
  };

  const { user, method, originalUrl } = req;
  const { roles: userRoles, isOwner } = user;
  
  //console.log(req.user);
  req.hardDelete = req.route.path.includes('hard');

  // If requester user is owner can do all.
  if (isOwner) {
    return next();
  }
  const urlArray = originalUrl.split('/');
  const entity = (urlArray.length > 4) ? urlArray[4] : urlArray[2];
  
  //console.log('urlArray:', urlArray);
  
  console.log('entity:', entity);

  // const businessUuidRequested = params?.uuid || '';
  let businessUuidOrigin = '';

  if (!req.params?.businessUuid && entity !== 'businesses'){
    return res.status(400).json({success: false, message: "'businessUuid' parameter required on URL"});
  }else{
    businessUuidOrigin = req.params?.businessUuid;
  }  
  
  let currentRole = userRoles.find( role => role.businessUuid === businessUuidOrigin);
  if (currentRole === undefined){
    currentRole = {role: 'Default', businessUuid:''}
  }; 
  const hasRoleOnBusinnes = currentRole.role !== 'Default';
  const canGetBusiness = currentRole.businessUuid === businessUuidOrigin;  
  const userBelongsToBusiness = (entity !== 'businesses') ? hasRoleOnBusinnes : hasRoleOnBusinnes && canGetBusiness;  
  const currentPermissions = permissions[currentRole?.role][entity] || [];
  const hasPermission = currentPermissions.includes(method);
  
  if (entity === 'businesses' && method === 'GET' && !req.params?.businessUuid){
    return next(); // Allow getting all businesses if no specific businessUuid is requested 
  }
  
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
