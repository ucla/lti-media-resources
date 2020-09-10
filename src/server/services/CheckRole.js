/**
 * Check if the user is a student, instructor, or admin
 *
 * @param {Array} rawRoles  Array of roles the user possess according to ltijs.
 * @returns {boolean}   Return if user is a student, instructor, or admin.
 */
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

/**
 * Check if the user is an admin
 *
 * @param {Array} rawRoles  Array of roles the user possess according to ltijs.
 * @returns {boolean}   Return if user is an admin.
 */
module.exports.isAdmin = function(rawRoles) {
  const roles = rawRoles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  return roles.includes('administrator');
};

/**
 * Check if the user is an instructor or admin
 *
 * @param {Array} rawRoles  Array of roles the user possess according to ltijs.
 * @returns {boolean}   Return if user is an instructor or admin.
 */
module.exports.isInstructorOrAdmin = function(rawRoles) {
  const roles = rawRoles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  return roles.includes('instructor') || roles.includes('administrator');
};
