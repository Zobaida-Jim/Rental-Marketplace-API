import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middleware/auth.js";
import { ReviewController } from "./review.controller.js";

const router = Router();

router.post(
    "/",
    auth(Role.TENANT),
    ReviewController.createReview
);

export const reviewRoutes = router;