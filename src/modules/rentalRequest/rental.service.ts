import { prisma } from "../../lib/prisma.js";
import { blockedStatus } from "../../utils/blockedStatus.js";
import { IRentalRequestPayload } from "./rental.interface.js"

const createRentalRequest = async (payload: IRentalRequestPayload, userId: string) => {
    const { propertyId, moveInDate, message } = payload;

    const tenant = await prisma.user.findFirstOrThrow({
        where: {
            id: userId
        }
    })
    blockedStatus(tenant.activeStatus);

    const property = await prisma.property.findUnique({
        where: {
            id: propertyId
        }
    })
    if (!property) {
        throw new Error("Your requested property is not found in Database.");
    }

    const isRentalRequestExist = await prisma.rentalRequest.findFirst({
        where: {
            tenantId: userId,
            propertyId: propertyId
        }
    })

    if (isRentalRequestExist) {
        throw new Error(`You already created a request for this property at ${isRentalRequestExist.createdAt}`);
    }

    const rental = await prisma.rentalRequest.create({
        data: {
            propertyId,
            moveInDate: new Date(moveInDate),
            tenantId: userId,
            message
        }
    })

    return rental;
}

const getRentalRequest = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user || user.activeStatus === 'BLOCKED') {
        throw new Error("You are not elligible to access this route.");
    }
    let requests;

    if (user.role === 'ADMIN') {
        requests = await prisma.rentalRequest.findMany({
            include: {
                property: {
                    select: {
                        landlordId: true,
                        title: true,
                        description: true,
                        rentAmount: true,
                        landlord: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                tenant: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });
    }
    else if (user.role === 'LANDLORD') {
        requests = await prisma.property.findMany({
            where: {
                landlordId: userId
            },
            include: {
                rentalRequests: {
                    select: {
                        id: true,
                        message: true,
                        status: true,
                        tenant: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })
    }
    else if (user.role === 'TENANT') {
        requests = await prisma.rentalRequest.findMany({
            where: {
                tenantId: userId
            },
            include: {
                property: {
                    select: {
                        title: true,
                        description: true,
                        rentAmount: true,
                        landlord: {
                            select: {
                                name: true,
                                email: true
                            }
                        },
                        category: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })
    }

    return requests;
}

export const rentalRequestServices = {
    createRentalRequest,
    getRentalRequest,
}