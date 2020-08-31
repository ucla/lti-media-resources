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
    '1': 2,
    '2': 3,
    F: 4,
  };

  return `${year}${quarterNumbers[quarter]}`;
}

/**
 * Sorts an array of academic terms in chronological order.
 *
 * @param {Array} termsArray An array of terms to sort
 * @param {boolean} descending Optional parameter to return terms in descending order (most recent first)
 * @returns {Array} A sorted array of terms
 */
module.exports.sortAcademicTerms = function(termsArray, descending = false) {
  const termsEnumArray = [];
  const termsEnumMap = new Map();
  for (const term of termsArray) {
    const enumeratedTerm = enumerateAcademicTerm(term);
    termsEnumArray.push(enumeratedTerm);
    termsEnumMap.set(enumeratedTerm, term);
  }

  termsEnumArray.sort();
  if (descending) termsEnumArray.reverse();

  const sortedTerms = [];
  for (const enumeratedTerm of termsEnumArray) {
    sortedTerms.push(termsEnumMap.get(enumeratedTerm));
  }

  return sortedTerms;
};
