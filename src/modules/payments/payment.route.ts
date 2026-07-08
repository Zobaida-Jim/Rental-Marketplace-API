import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller.js";

const router = Router();

router.post(
    "/create",
    auth(Role.TENANT),
    paymentController.createPaymentSession
)

router.post("/webhook", paymentController.confirmPayment);

export const paymentRoutes = router;