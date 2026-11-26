// Runs when no route matched. Forwards a 404 to the error handler below.
export function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
}

// Express recognises a function with 4 arguments as the central error handler.
// Every thrown/forwarded error ends up here and is returned as { error: "message" }.
export function errorHandler(err, req, res, next) {
  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  // Never leak internal error details on 500s.
  const message = status >= 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
}
