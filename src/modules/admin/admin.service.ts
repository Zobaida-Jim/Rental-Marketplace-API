import { prisma } from "../../lib/prisma.js"
import { blockedStatus } from "../../utils/blockedStatus.js";
import { IUpdateUserStatusPayload } from "./admin.interface.js";

const getAllUsers = async (userId: string) => {

    const Admin = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        }
    })

    blockedStatus(Admin?.activeStatus)

    const users = await prisma.user.findMany({
        omit: {
            password: true
        },
        include: {
            properties: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    rentAmount: true,
                    amenities: true,
                    isAvailable: true
                }
            },
            rentalRequests: {
                select: {
                    id: true,
                    message: true,
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return users;
}

const updateUserStatus = async (userId: string, payload: IUpdateUserStatusPayload, adminId: string) => {

    const admin = await prisma.user.findUniqueOrThrow({
        where: {
            id: adminId
        }
    })
    blockedStatus(admin.activeStatus);


    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    if (!user) {
        throw new Error("User is not found.");
    }
    if (user.activeStatus === payload.status) {
        throw new Error("User's active status is up todate");
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            activeStatus: payload.status
        }
    })

    return updatedUser;
}

const createCategory = async (categoryName: string) => {
    const toLower = categoryName.toLowerCase();
    const isCategoryExist = await prisma.category.findFirst({
        where: {
            name: {
                equals: toLower,
                mode: "insensitive"
            }
        }
    });

    if (isCategoryExist) {
        throw new Error("This category is already exist.");
    }

    const category = await prisma.category.create({
        data: {
            name: categoryName
        }
    })

    return category;
}

export const adminServices = {
    getAllUsers,
    updateUserStatus,
    createCategory
}