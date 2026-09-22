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
        throw new Error(`Backend server is offline (HTTP ${res.status}). Please run 'npm run dev' to start the backend server.`);
      }
      return {};
    }
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Cannot connect to backend server. Please verify the server is running on port 5050 (npm run dev).');
    }
    throw err;
  }
}
