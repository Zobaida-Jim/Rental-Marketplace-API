import { PropertyWhereInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import { IPropertyQuery } from "./property.interface.js"

const getAllProperties = async (query: IPropertyQuery) => {
    const { location, maxPrice, minPrice, type, isAvailable, amenities } = query;

    const whereConditions: PropertyWhereInput = {};

    if (location) {
        whereConditions.location = {
            contains: location,
            mode: "insensitive"
        }
    }

    if (isAvailable !== undefined) {
        whereConditions.isAvailable = isAvailable === "true";
    }

    if (maxPrice || minPrice) {
        whereConditions.rentAmount = {};

        if (maxPrice) {
            whereConditions.rentAmount.lte = Number(maxPrice)
        }
        if (minPrice) {
            whereConditions.rentAmount.gte = Number(minPrice)
        }
    }

    if (type) {
        whereConditions.category = {
            name: {
                equals: type,
                mode: "insensitive"
            }
        }
    }

    const properties = await prisma.property.findMany({
        where: whereConditions,
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
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    if (!amenities) {
        return properties;
    }

    const amenitiesArray = Array.isArray(amenities) ? amenities : JSON.parse(amenities as string);

    const matchedProperties = properties.filter(property =>
        amenitiesArray.some((amenity: string) =>
            property.amenities.some(dbAmenity =>
                dbAmenity.toLowerCase() === amenity.toLowerCase()
            )
        )
    );

    return matchedProperties.length > 0 ? matchedProperties : properties;
}

const getPropertyDetails = async (propertyId: string) => {
    const property = await prisma.property.findUnique({
        where: {
            id: propertyId
        },
        include: {
            category: {
                select: {
                    name: true
                }
            },
            landlord: {
                select: {
                    email: true,
                    name: true
                }
            }, reviews: {
                select: {
                    rating: true,
                    tenant: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    comment: true,
                    createdAt: true
                }
            }
        }
    })

    if (!property) {
        throw new Error("Property is not found!");
    }

    return property;
}

const getAllPropertyCategories = async () => {
    const categories = await prisma.category.findMany({});

    return categories;
}

export const propertiesServices = {
    getAllProperties,
    getPropertyDetails,
    getAllPropertyCategories
}