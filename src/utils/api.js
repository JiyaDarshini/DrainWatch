/**
 * Safe response JSON parsing utility.
 * Prevents "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
 * when the server is offline, restarting, or returns empty / non-JSON responses.
 */
export async function safeJson(res, defaultErrMsg = 'Error communicating with server') {
  try {
    const text = await res.text();
    if (!text || text.trim() === '') {
      if (!res.ok) {
        throw new Error(`Server returned HTTP error ${res.status}. Please try again.`);
      }
      return {};
    }
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Unable to connect to backend server. Please verify your connection and try again.');
    }
    throw err;
  }
}
