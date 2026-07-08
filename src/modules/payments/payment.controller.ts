import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from 'http-status';
import { paymentServices } from "./payment.service.js";

const createPaymentSession = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const result = await paymentServices.createPaymentSession(
            req.body.rentalRequestId,
            userId as string
        );

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "Checkout session created successfully",
            data: result,
        });
    }
);

const confirmPayment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const signature = req.headers['stripe-signature'] as string;
        const event = req.body as Buffer;

        if (!signature) {
            throw new Error("Stripe signature missing.");
        }

        const result = await paymentServices.confirmPayment(event, signature);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "Payment confirme!",
            data: {
                result
            }
        })
    });


export const paymentController = {
    createPaymentSession,
    confirmPayment
}