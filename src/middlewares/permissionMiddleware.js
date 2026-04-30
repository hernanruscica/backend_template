export const permissionMiddleware = async (req, res, next) => {
 

  // 'POST', 'GET', 'PUT', 'DELETE'
  const permissions = {
    'Administrator': {
      'businesses': ['GET', 'PUT'],
      'users': ['POST', 'GET', 'PUT', 'DELETE'],      
      'dataloggers': ['POST', 'GET', 'PUT', 'DELETE'],
      'channels': ['POST', 'GET', 'PUT', 'DELETE'],
      'alarms': ['POST', 'GET', 'PUT', 'DELETE'],
      'user-businesses': ['POST', 'GET', 'PUT', 'DELETE'],
      'users-alarms': ['POST', 'GET', 'PUT', 'DELETE'],
      'alarmlogs': ['POST', 'GET', 'PUT', 'DELETE']
    },
    'Technician': {
      'businesses': ['GET'],
      'users': ['GET', 'PUT'],      
      'dataloggers': ['GET'],
      'channels': ['GET'],
      'alarms': ['GET'],
      'users-alarms': ['GET'],
      'alarmlogs': ['GET', 'PUT']
    },
    'Default': {
      'businesses': [''],
      'users': ['', ''],
      'dataloggers': ['', '', '', '']
    }
  };

  const { user, method, originalUrl } = req;
  const { roles: userRoles, isOwner } = user;
  
  req.hardDelete = req.route.path.includes('hard');   
  




  // If requester user is owner can do all.
  if (isOwner) {
    return next();
  }
  const urlArray = originalUrl.split('/');
  const entity = (urlArray.length > 4) ? urlArray[4] : urlArray[2];
  
  //console.log('urlArray:', urlArray);  
  
  //console.log('userRoles', userRoles);
  //console.log('entity', entity);
  

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
