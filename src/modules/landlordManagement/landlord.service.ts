import { Prisma, RentalRequestStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js"
import { blockedStatus } from "../../utils/blockedStatus.js";
import { ICreateRentPayload, IStatusApprovedOrRejectPayload, IUpdateRentPayload } from "./landlord.interface.js"

const createNewPost = async (payload: ICreateRentPayload, userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        throw new Error("User is not exist!");
    }
    if (user.role !== 'LANDLORD') {
        throw new Error("You are not a landlord. So, you can not create a property listing.");
    }

    blockedStatus(user.activeStatus);

    const categoryName = payload.categoryName;
    const category = await prisma.category.findUnique({
        where: {
            name: categoryName
        }
    })

    if (!category) {
        throw new Error("This category does not exist. Please check the category list first.");
    }

    const createdProperty = await prisma.property.create({
        data: {
            landlordId: userId,
            title: payload.title,
            description: payload.description,
            address: payload.address,
            location: payload.location,
            rentAmount: Number(payload.rentAmount),
            categoryId: category.id,
        }
    })

    const property = await prisma.property.findUniqueOrThrow({
        where: {
            id: createdProperty.id,
            landlordId: createdProperty.landlordId
        },
        include: {
            category: {
                select: {
                    name: true
                }
            },
            landlord: {
                select: {
                    name: true
                }
            }
        }
    })

    return property;
}

const updateProperty = async (payload: IUpdateRentPayload, propertyId: string, userId: string) => {

    const property = await prisma.property.findUnique({
        where: {
            id: propertyId
        },
        include: {
            landlord: {
                select: {
                    activeStatus: true
                }
            }
        }
    })

    if (!property) {
        throw new Error("Property does not exist !!!");
    }
    if (property.landlordId !== userId) {
        throw new Error("You are not the owner of this property !");
    }

    blockedStatus(property.landlord.activeStatus);

    const { categoryName, ...restPayload } = payload;

    const data: Prisma.PropertyUpdateInput = {
        ...restPayload
    }

    let categoryId;
    if (categoryName) {
        const category = await prisma.category.findUnique({
            where: {
                name: categoryName
            }
        })

        if (!category) {
            const newCategory = await prisma.category.create({
                data: {
                    name: categoryName
                }
            })
            categoryId = newCategory.id;
        } else {
            categoryId = category?.id;
        }
    }

    if (categoryId) {
        data.category = {
            connect: {
                id: categoryId
            }
        }
    }

    const updatedProperty = await prisma.property.update({
        where: {
            id: propertyId
        },
        data,
        include: {
            category: {
                select: {
                    name: true
                }
            }
        }
    })

    return updatedProperty;
}

const deleteProperty = async (propertyId: string, userId: string) => {
    const property = await prisma.property.findUnique({
        where: {
            id: propertyId
        },
        include: {
            landlord: {
                select: {
                    activeStatus: true
                }
            }
        }
    })

    if (!property) {
        throw new Error("Property does not exist !!!");
    }
    if (property.landlordId !== userId) {
        throw new Error("You are not the owner of this property !");
    }
    blockedStatus(property.landlord.activeStatus);

    const deletedProperty = await prisma.property.delete({
        where: {
            id: propertyId
        }
    })

    return deletedProperty;
}

const myProperty = async (userId: string) => {
    const properties = await prisma.property.findMany({
        where: {
            landlordId: userId
        }, include: {
            rentalRequests: {
                select: {
                    message: true,
                    moveInDate: true,
                    tenant: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            }, reviews: {
                select: {
                    rating: true,
                    comment: true
                }
            }
        }
    })

    return properties;
}

const approveORreject = async (requestId: string, userId: string, payload: IStatusApprovedOrRejectPayload) => {
    const request = await prisma.rentalRequest.findUnique({
        where: {
            id: requestId
        },
        include: {
            property: {
                select: {
                    id: true,
                    landlordId: true,
                    landlord: {
                        select: {
                            activeStatus: true
                        }
                    }
                }
            }
        }
    })

    if (!payload) {
        throw new Error("Please Enter status")
    }

    if (!request) {
        throw new Error("This rental request is not found !");
    }

    if (request?.status !== RentalRequestStatus.PENDING) {
        throw new Error("This request is not a pending request! So, you can't change this status. If any APPROVED TENANT completed payment process successfully then the other approved status will be rejected automatically !");
    }

    if (request.property.landlordId !== userId) {
        throw new Error("You are not the owner of this property !");
    }

    if (request.status === payload.status) {
        throw new Error("Request status is uptodate.");
    }

    blockedStatus(request.property.landlord.activeStatus);

    const updatedStatus = await prisma.rentalRequest.update({
        where: {
            id: request.id
        }, data: {
            status: payload.status
        }
    })

    return updatedStatus;
}

const tenantHistory = async (tenantId: string) => {
    const isTenantExist = await prisma.user.findUnique({
        where: {
            id: tenantId
        },
        omit: {
            password: true,
            id: true
        },
        include: {
            rentalRequests: {
                select: {
                    message: true,
                    property: {
                        select: {
                            title: true,
                            description: true,
                            rentAmount: true,
                            reviews: {
                                select: {
                                    rating: true,
                                    comment: true,
                                    createdAt: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!isTenantExist) {
        throw new Error("This tenant does not exist.")
    }

    return isTenantExist;
}

export const landlordServices = {
    createNewPost,
    updateProperty,
    deleteProperty,
    myProperty,
    approveORreject,
    tenantHistory
}