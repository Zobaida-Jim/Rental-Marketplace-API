import { Router } from "express";
import { propertiesController } from "./property.controller.js";
import { auth } from "../../middleware/auth.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.get("/", propertiesController.getAllProperties);
router.get(
    "/categories",
    auth(Role.ADMIN, Role.LANDLORD),
    propertiesController.getAllPropertyCategories
);
router.get("/:id", propertiesController.getPropertyDetails);

export const propertyRoutes = router;