import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { propertiesServices } from "./property.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpstatus from "http-status"

const getAllProperties = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;

        const result = await propertiesServices.getAllProperties(query);

        sendResponse(res, {
            success: true,
            statuCode: httpstatus.OK,
            message: "Properties retrieved successfully!",
            data: {
                result
            }
        })
    }
)

const getPropertyDetails = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id as string;

        const property = await propertiesServices.getPropertyDetails(id);

        sendResponse(res, {
            success: true,
            statuCode: httpstatus.OK,
            message: "Property details retrieved successfully!",
            data: {
                property
            }
        })
    }
)

const getAllPropertyCategories = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const categories = await propertiesServices.getAllPropertyCategories();

        sendResponse(res, {
            success: true,
            statuCode: httpstatus.OK,
            message: "All property categories are retrieved successfully!",
            data: {
                categories
            }
        })
    }
)

export const propertiesController = {
    getAllProperties,
    getPropertyDetails,
    getAllPropertyCategories
}