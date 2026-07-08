import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { landlordServices } from "./landlord.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const createNewPost = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;

        const userId = req.user?.id as string;

        const property = await landlordServices.createNewPost(payload, userId);

        sendResponse(res, ({
            success: true,
            statuCode: httpStatus.OK,
            message: "New Property created successfully !!",
            data: {
                property
            }
        }))
    }
)

const updateProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const propertyId = req.params.id;
        const userId = req.user?.id

        if (!propertyId) {
            throw new Error("Property ID is required in params.");
        }

        const updatedProperty = await landlordServices.updateProperty(
            payload,
            propertyId as string,
            userId as string
        );

        sendResponse(res, ({
            success: true,
            statuCode: httpStatus.OK,
            message: "Property updated successfully !!",
            data: {
                updatedProperty
            }
        }))
    }
)

const deleteProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const propertyId = req.params.id;
        const userId = req.user?.id

        if (!propertyId) {
            throw new Error("Property ID is required in params.");
        }

        const property = await landlordServices.deleteProperty(propertyId as string, userId as string)

        sendResponse(res, ({
            success: true,
            statuCode: httpStatus.OK,
            message: "Property deleted successfully !!",
            data: {
                property
            }
        }))
    }
)

const myProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id as string;

        const properties = await landlordServices.myProperty(userId);

        sendResponse(res, ({
            success: true,
            statuCode: httpStatus.OK,
            message: "Properties retrieved successfully !!",
            data: {
                properties
            }
        }))
    }
)

const approveORreject = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const rentalRequestId = req.params.id;
        const userId = req.user?.id;
        const payload = req.body;

        const result = await landlordServices.approveORreject(
            rentalRequestId as string,
            userId as string,
            payload
        )

        sendResponse(res, ({
            success: true,
            statuCode: httpStatus.OK,
            message: "Property deleted successfully !!",
            data: {
                result
            }
        }))
    }
)

const tenantHistory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.params.id;

        const tenant = await landlordServices.tenantHistory(tenantId as string);

        sendResponse(res, ({
            success: true,
            statuCode: httpStatus.OK,
            message: "Tenant history retrieved successfully !!",
            data: {
                tenant
            }
        }))
    }
)

export const landlordControllers = {
    createNewPost,
    updateProperty,
    deleteProperty,
    myProperty,
    approveORreject,
    tenantHistory
}