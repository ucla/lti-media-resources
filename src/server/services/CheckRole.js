module.exports.isUser = function(rawRoles) {
  const roles = rawRoles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  return (
    roles.includes('learner') ||
    roles.includes('instructor') ||
    roles.includes('administrator')
  );
};

module.exports.isAdmin = function(rawRoles) {
  const roles = rawRoles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  return roles.includes('administrator');
};

module.exports.isInstructorOrAdmin = function(rawRoles) {
  const roles = rawRoles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  return roles.includes('instructor') || roles.includes('administrator');
};
