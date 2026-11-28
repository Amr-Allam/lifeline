import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

try {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set. Copy .env.example to .env and fill it in.");
  }
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
} catch (err) {
  console.error("Failed to start server:", err.message);
  process.exit(1);
}
