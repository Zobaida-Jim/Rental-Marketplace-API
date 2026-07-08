import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { adminServices } from "./admin.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const getAllUsers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const users = await adminServices.getAllUsers(req.user?.id as string);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "All users are retrieved successfully!",
            data: {
                users
            }
        })
    }
)

const updateUserStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {

        const userId = req.params.id;
        const payload = req.body;
        const adminId = req.user?.id;

        const user = await adminServices.updateUserStatus(userId as string, payload, adminId as string);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "All users are retrieved successfully!",
            data: {
                user
            }
        })
    }
)

const createCategory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const { categoryName } = payload
        const category = await adminServices.createCategory(categoryName);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "Category created successfully!",
            data: {
                category
            }
        })
    }
)

export const adminControllers = {
    getAllUsers,
    updateUserStatus,
    createCategory
}