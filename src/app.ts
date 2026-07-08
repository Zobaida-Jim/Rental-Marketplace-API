import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config/index.js";
import { userRoutes } from "./modules/user/user.route.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";
import { landlordRoutes } from "./modules/landlordManagement/landlord.route.js";
import { propertyRoutes } from "./modules/property/property.route.js";
import { rentalRequestRoutes } from "./modules/rentalRequest/rental.route.js";
import { adminRoutes } from "./modules/admin/admin.route.js";
import { paymentRoutes } from "./modules/payments/payment.route.js";
import { reviewRoutes } from "./modules/review/review.route.js";
import { notFound } from "./middleware/notFoundRoute.js";

const app: Application = express()

app.use(cors({
    origin: config.app_url,
    credentials: true
}))

app.use("/api/payments/webhook", express.raw({ type: 'application/json' }))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.send("Root route is working, YAHOOOOOOOO!!!!");
})

app.use("/api/auth", userRoutes);
app.use("/api/landlord", landlordRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/rentals", rentalRequestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(notFound);

app.use(globalErrorHandler)

export default app;