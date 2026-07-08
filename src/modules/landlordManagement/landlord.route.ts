import { Router } from "express";
import { landlordControllers } from "./landlord.controller.js";
import { auth } from "../../middleware/auth.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router()

router.post(
    "/properties",
    auth(Role.LANDLORD, Role.ADMIN, Role.TENANT),
    landlordControllers.createNewPost
)

router.put(
    "/properties/:id",
    auth(Role.LANDLORD, Role.ADMIN, Role.TENANT),
    landlordControllers.updateProperty
)

router.get(
    "/my-properties",
    auth(Role.LANDLORD),
    landlordControllers.myProperty
)

router.delete(
    "/properties/:id",
    auth(Role.LANDLORD),
    landlordControllers.deleteProperty
)

router.patch(
    "/requests/:id",
    auth(Role.LANDLORD),
    landlordControllers.approveORreject
)

router.get(
    "/tenant/:id",
    auth(Role.LANDLORD, Role.ADMIN),
    landlordControllers.tenantHistory
)

export const landlordRoutes = router;