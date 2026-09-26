exports.handler = async function(event) {
  const key = process.env.OLP_API_KEY;

  if (!key) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: { message: "Open Labor Project API key is not configured." }
      })
    };
  }

  const q = event.queryStringParameters || {};
  const allowed = new Set([
    "fluid-specs",
    "torque-specs"
  ]);

  const endpoint = String(q.endpoint || "");

  if (!allowed.has(endpoint)) {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: { message: "Unsupported external specs endpoint." }
      })
    };
  }

  const params = new URLSearchParams();

  for (const name of [
    "make",
    "model",
    "year",
    "engine"
  ]) {
    if (q[name]) params.set(name, q[name]);
  }

  const url =
    "https://openlaborproject.com/api/v1/" +
    endpoint +
    "?" +
    params.toString();

  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": key,
        "accept": "application/json"
      }
    });

    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ||
          "application/json"
      },
      body
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: {
          message: "Could not reach Open Labor Project."
        }
      })
    };
  }
};
