// Creates an Error carrying an HTTP status. The central errorHandler turns it
// into { error: "message" } with that status.
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
