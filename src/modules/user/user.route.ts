import { Router } from "express";
import { userControllers } from "./user.controller.js";
import { auth } from "../../middleware/auth.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.post("/register", userControllers.registerUser);
router.post(
    "/login", userControllers.loginUser
);
router.get(
    "/me",
    auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
    userControllers.getMyInfo
);
router.put(
    "/my-profile",
    auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
    userControllers.updateMyProfile
)

router.post("/refresh-token", userControllers.refreshToken);

router.delete(
    "/delete",
    auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
    userControllers.deleteProfile
)

export const userRoutes = router;