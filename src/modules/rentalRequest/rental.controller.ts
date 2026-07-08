import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { rentalRequestServices } from "./rental.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const createRentalRequest = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        const payload = req.body;
        const userId = req.user?.id

        if (userRole !== "TENANT") {
            throw new Error("You are not a tenant. So, you can't create a rental request");
        }

        const request = await rentalRequestServices.createRentalRequest(payload, userId as string);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "Rental request is created successfully !",
            data: {
                request
            }
        })
    }
)

const getRentalRequest = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const requests = await rentalRequestServices.getRentalRequest(userId as string);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: `All rental request are retrieved successfully based on your role ! You are a ${req.user?.role}`,
            data: {
                requests
            }
        })
    }
)

export const rentalRequestControllers = {
    createRentalRequest,
    getRentalRequest,
}