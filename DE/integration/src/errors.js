// errors.js : translate PostgreSQL error codes into clean HTTP responses
const PG_ERRORS = {
  '23505': [409, 'Duplicate value: a record with this unique value already exists.'],      // unique_violation
  '23503': [409, 'Invalid reference: related record does not exist or is still in use.'],  // foreign_key_violation
  '23502': [400, 'A required value is missing.'],                                          // not_null_violation
  '23514': [400, 'A value is outside the allowed range or format.'],                       // check_violation
  '22P02': [400, 'A value has the wrong data type.'],                                      // invalid_text_representation
  '22007': [400, 'Invalid date format. Use YYYY-MM-DD.'],                                  // invalid_datetime_format
};

function errorHandler(err, req, res, next) {   // eslint-disable-line no-unused-vars
  if (err.status) return res.status(err.status).json({ error: err.message });
  const mapped = PG_ERRORS[err.code];
  if (mapped) return res.status(mapped[0]).json({ error: mapped[1], constraint: err.constraint, detail: err.detail });
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

const httpError = (status, message) => Object.assign(new Error(message), { status });

module.exports = { errorHandler, httpError };
