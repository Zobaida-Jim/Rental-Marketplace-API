import { Router } from "express";
import { rentalRequestControllers } from "./rental.controller.js";
import { auth } from "../../middleware/auth.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.post(
    "/",
    auth(Role.TENANT),
    rentalRequestControllers.createRentalRequest
);

router.get(
    "/",
    auth(Role.LANDLORD, Role.TENANT, Role.ADMIN),
    rentalRequestControllers.getRentalRequest
)

export const rentalRequestRoutes = router;