//////////////// STATUS CODES AND DEFINITION
// 200 - OK
// 201 - Created
// 204 - No Content
// 400 - Bad Request
// 401 - Unauthorized
// 403 - Forbidden
// 404 - Not Found
// 408 - Request Timeout
// 500 - Internal Server Error
// 501 - Not Implemented
// 502 - Bad Gateway
// 503 - Service Unavailable
// 504 - Gateway Timeout

const httpStatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  INTERNAL_SERVER: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

module.exports = httpStatusCodes;
