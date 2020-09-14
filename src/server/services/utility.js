// Utility functions

/**
 * Helper function to create sortable terms.
 *
 * @param {string} term Academic term to enumerate
 * @returns {string} Sortable representation of academic term
 */
function enumerateAcademicTerm(term) {
  // Assumption: 65F is the oldest term that the registrar has.
  // Treat years 65 and older as 19XX and years before as 20XX.
  let year = term.substring(0, term.length - 1);
  if (parseInt(year) < 65) {
    year = `20${year.padStart(2, '0')}`;
  } else {
    year = `19${year}`;
  }

  const quarter = term.slice(-1);
  const quarterNumbers = {
    W: 0,
    S: 1,
    1: 2,
    2: 3,
    F: 4,
  };

  return `${year}${quarterNumbers[quarter]}`;
}

/**
 * Compares two academic terms. Returns -1 if term1 is chronologically earlier than term2.
 *
 * @param {string} term1 First academic term to compare
 * @param {string} term2 Second academic term to compare
 * @returns {number} -1 if term1 is earlier than term2, 1 if term1 is later, 0 if equal
 */
module.exports.compareAcademicTerms = function (term1, term2) {
  const term1Enum = enumerateAcademicTerm(term1);
  const term2Enum = enumerateAcademicTerm(term2);

  if (term1Enum < term2Enum) return -1;
  if (term1Enum > term2Enum) return 1;
  return 0;
};
