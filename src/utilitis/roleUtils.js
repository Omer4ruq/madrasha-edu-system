export const hasSuperAdminRole = (role) => {
  if (!role) return false;
  
  // Check if role is a string and contains 'SuperAdmin'
  if (typeof role === 'string') {
    return role.includes('Superadmin');
  }
  
  // Check if role is an array and contains 'SuperAdmin'
  if (Array.isArray(role)) {
    return role.some(r => r.includes('Superadmin'));
  }
  
  // Check if role is an object with SuperAdmin property
  if (typeof role === 'object') {
    return Object.values(role).some(value => 
      typeof value === 'string' && value.includes('Superadmin')
    );
  }
  
  return false;
};