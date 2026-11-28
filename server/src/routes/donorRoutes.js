import { Router } from "express";
import { getMe, updateMe, search } from "../controllers/donorController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// Every donor route needs a logged-in user; requireRole then checks the role.
router.use(authenticate);

router.get("/me", requireRole("donor"), getMe);
router.patch("/me", requireRole("donor"), updateMe);
router.get("/search", requireRole("requester", "admin"), search);

export default router;
