import { Router } from "express";
import { adminControllers } from "./admin.controller.js";
import { auth } from "../../middleware/auth.js";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/users",
    auth(Role.ADMIN),
    adminControllers.getAllUsers
);

router.patch(
    "/users/:id",
    auth(Role.ADMIN),
    adminControllers.updateUserStatus
)

router.post(
    "/create-category",
    auth(Role.ADMIN),
    adminControllers.createCategory
)

export const adminRoutes = router;