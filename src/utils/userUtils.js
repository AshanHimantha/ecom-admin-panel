// Utility functions for user management and role handling

export const getUserRole = (userAttributes) => {
  // Check for custom role attribute
  if (userAttributes['custom:role']) {
    return userAttributes['custom:role'];
  }
  
  // Check for Cognito groups (if using Cognito Groups for roles)
  if (userAttributes['cognito:groups']) {
    const groups = userAttributes['cognito:groups'].split(',');
    return groups[0]; // Return first group as primary role
  }
  
  // Default role
  return 'User';
};