import { prisma } from "../../lib/prisma.js";
import { TReview } from "./review.interface.js";

const createReview = async (tenantId: string, payload: TReview) => {
    const rentalRequest = await prisma.rentalRequest.findFirst({
        where: {
            tenantId,
            propertyId: payload.propertyId,
            status: "ACTIVE",
            payment: {
                status: "COMPLETED"
            }
        }, include: {
            payment: true
        }
    });

    if (!rentalRequest) {
        throw new Error(
            "You can review this property only after completing the payment."
        );
    }

    const existingReview = await prisma.review.findUnique({
        where: {
            tenantId_propertyId: {
                tenantId,
                propertyId: payload.propertyId
            }
        }
    });

    if (existingReview) {
        throw new Error(
            "You have already reviewed this property."
        );
    }

    if (payload.rating <= 0 || payload.rating > 5) {
        throw new Error("Rating range is 1-to-5");
    }

    const review = await prisma.review.create({
        data: {
            rating: payload.rating,
            comment: payload.comment,
            tenantId,
            propertyId: payload.propertyId
        }, include: {
            tenant: {
                select: {
                    id: true,
                    name: true
                }
            }, property: {
                select: {
                    id: true,
                    title: true,
                    location: true
                }
            }
        }
    });
    return review;
};

export const ReviewServices = {
    createReview
}