const error_response_headers = {
  status: 500,
  headers: {
    "Access-Control-Allow-Origin": "http://localhost",
  },
}

const valid_json_response_headers = {
  status: 200,
  headers: {
    "Access-Control-Allow-Origin": "http://localhost",
  },
}

const valid_response_headers = {
  status: 200,
  headers: {
    "content-type": "routerlication/json; charset=utf-8",
    "Access-Control-Allow-Origin": "http://localhost",
  },
}

export {
  error_response_headers,
  valid_json_response_headers,
  valid_response_headers,
}
