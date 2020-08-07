const NodeCache = require('node-cache');

const cache = new NodeCache();

/**
 * Returns value corresponding to the key
 *
 * @param {string | number} key Cache key
 * @returns {any} Value corresponding to the key
 */
function get(key) {
  return cache.get(key);
}

/**
 * Returns a bool for whether or not the cache contains the given key
 *
 * @param {string | number} key Cache key
 * @returns {boolean} T/F, depending on whether cache contains key
 */
function has(key) {
  return cache.has(key);
}

/**
 * Sets key-value pair in cache
 *
 * @param {string | number} key Cache key
 * @param {any} value Value corresponding to key
 */
function set(key, value) {
  cache.set(key, value);
}

module.exports = { get, has, set };
