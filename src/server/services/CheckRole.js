module.exports.isUser = function(rawRoles) {
  const roles = rawRoles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  if (
    !roles.includes('learner') &&
    !roles.includes('teacher') &&
    !roles.includes('instructor') &&
    !roles.includes('administrator') &&
    !roles.includes('admin')
  ) {
    return false;
  }
  return true;
};

module.exports.isAdmin = function(rawRoles) {
  const roles = rawRoles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  if (!roles.includes('administrator') && !roles.includes('admin')) {
    return false;
  }
  return true;
};

module.exports.isInstructor = function(rawRoles) {
  const roles = rawRoles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  if (
    !roles.includes('instructor') &&
    !roles.includes('teacher') &&
    !roles.includes('administrator') &&
    !roles.includes('admin')
  ) {
    return false;
  }
  return true;
};
