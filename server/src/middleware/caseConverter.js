'use strict';

/**
 * Convert a string from camelCase to snake_case.
 * @param {string} str
 * @returns {string}
 */
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert a string from snake_case to camelCase.
 * @param {string} str
 * @returns {string}
 */
function snakeToCamel(str) {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

/**
 * Recursively convert keys of an object or array.
 * @param {any} obj
 * @param {Function} convertFn
 * @returns {any}
 */
function convertKeys(obj, convertFn) {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, convertFn));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const acc = {};
    for (const key of Object.keys(obj)) {
      const convertedKey = convertFn(key);
      acc[convertedKey] = convertKeys(obj[key], convertFn);
    }
    return acc;
  }
  return obj;
}

/**
 * Express middleware to transparently convert camelCase request body keys to snake_case,
 * and snake_case response body keys back to camelCase.
 */
function caseConverter(req, res, next) {
  // 1. Convert incoming request body keys from camelCase to snake_case
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    req.body = convertKeys(req.body, camelToSnake);
  }

  // 2. Intercept response json method to convert outgoing keys to camelCase
  const originalJson = res.json;
  res.json = function (body) {
    if (body !== null && typeof body === 'object') {
      body = convertKeys(body, snakeToCamel);
    }
    return originalJson.call(this, body);
  };

  next();
}

module.exports = {
  caseConverter,
  camelToSnake,
  snakeToCamel,
  convertKeys,
};
