/**
 * Safe response JSON parsing utility.
 * Prevents crashing when server is starting, returns HTML 500, or returns non-JSON.
 */
export async function safeJson(res, defaultErrMsg = 'Error communicating with server') {
  try {
    const text = await res.text();
    if (!text || text.trim() === '') {
      return { success: res.ok, message: res.ok ? 'OK' : `HTTP error ${res.status}` };
    }
    return JSON.parse(text);
  } catch (err) {
    return { success: false, message: 'Offline or non-JSON server response', isOffline: true };
  }
}
