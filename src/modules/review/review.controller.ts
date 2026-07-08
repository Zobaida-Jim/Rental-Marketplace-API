import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { ReviewServices } from "./review.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const createReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const userId = req.user?.id as string;

        const result = await ReviewServices.createReview(userId, payload);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.CREATED,
            message: "Review created successfully.",
            data: result
        });

    });

export const ReviewController = {
    createReview
}