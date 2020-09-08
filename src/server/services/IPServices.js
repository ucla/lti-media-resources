const { inRange } = require('range_check');

/**
 * Check if the user is on an oncampus IP
 *
 * @param {string} ipAddress  IP address that the user is on.
 * @returns {boolean}   Return if user is on an oncampus IP.
 */
module.exports.isOnCampusIP = function(ipAddress) {
  // List of acceptable IP addresses belonging to UCLA from https://kb.ucla.edu/articles/list-of-uc-related-ip-addresses
  const acceptableIPv4 = [
    '128.97.0.0/16',
    '131.179.0.0/16',
    '149.142.0.0/16',
    '164.67.0.0/16',
    '169.232.0.0/16',
    '172.16.0.0/12',
    '172.27.0.0/16',
    '192.35.210.0/24',
    '192.35.225.0/24',
    '192.154.2.0/24',
  ];

  const acceptableIPv6 = ['2607:F010::/32'];

  return (
    inRange(ipAddress, acceptableIPv4) || inRange(ipAddress, acceptableIPv6)
  );
};
