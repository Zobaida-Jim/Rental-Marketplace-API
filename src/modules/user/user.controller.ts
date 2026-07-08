import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { userServices } from "./user.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const registerUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const user = await userServices.registerUser(payload);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "Congratulations! User registered successfully!",
            data: {
                user
            }
        })
    }
)

const loginUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;

        const { accessToken, refreshToken } = await userServices.loginUser(payload);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 7
        })

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "User loged in successfully !",
            data: {
                accessToken, refreshToken
            }
        })
    }
)

const getMyInfo = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await userServices.getMyInfo(req.user?.id as string);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "User info retrieved successfully !",
            data: {
                user
            }
        })
    }
)

const updateMyProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const userId = req.user?.id;

        const result = await userServices.updateMyProfile(userId as string, payload);

        sendResponse(res, {
            success: true,
            statuCode: httpStatus.OK,
            message: "User info updated successfully !",
            data: {
                result
            }
        })
    }
)

const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    const { accessToken } = await userServices.refreshToken(refreshToken);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })

    sendResponse(res, {
        success: true,
        statuCode: httpStatus.OK,
        message: "Token refreshed successfully !",
        data: { accessToken }
    })
})

const deleteProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const result = await userServices.deleteMyProfile(userId as string);

        sendResponse(res, {
            statuCode: 200,
            success: true,
            message: "Profile deleted successfully.",
            data: result,
        });
    }
)

export const userControllers = {
    registerUser,
    loginUser,
    getMyInfo,
    updateMyProfile,
    refreshToken,
    deleteProfile
}