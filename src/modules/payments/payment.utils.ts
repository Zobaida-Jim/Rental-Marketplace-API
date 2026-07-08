import stripe from "stripe";
import { prisma } from "../../lib/prisma.js";

export const handleCheckoutCompleted = async (session: stripe.Checkout.Session) => {
    //console.log("Checkout completed event");

    const rentalRequestId = session.metadata?.rentalRequestId;

    if (!rentalRequestId) {
        throw new Error("Rental request id is missing from metadata.");
    }

    if (!session.payment_intent) {
        throw new Error("Payment intent not found.");
    }

    await prisma.$transaction(async (tx) => {

        const payment = await tx.payment.findUnique({
            where: {
                rentalRequestId
            }
        });

        if (!payment) {
            throw new Error("Payment not found.");
        }

        if (payment.status === "COMPLETED") {
            return;
        }

        await tx.payment.update({
            where: {
                rentalRequestId
            },
            data: {
                transactionId: session.payment_intent as string,
                status: "COMPLETED",
                paidAt: new Date()
            }
        });

        const rentalRequest = await tx.rentalRequest.update({
            where: {
                id: rentalRequestId
            },
            data: {
                status: "ACTIVE"
            }
        });

        await tx.property.update({
            where: {
                id: rentalRequest.propertyId
            },
            data: {
                isAvailable: false
            }
        });
    });

};