import Stripe from "stripe";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js"
import { stripe } from "../../lib/stripe.js";
import { handleCheckoutCompleted } from "./payment.utils.js";

const createPaymentSession = async (rentalRequestId: string, userId: string) => {
    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: {
            id: rentalRequestId
        },
        include: {
            property: true,
            payment: true
        }
    })

    if (!rentalRequest) {
        throw new Error("No such rental request is found in database. Please give a correct request ID.");
    }

    if (rentalRequest.tenantId !== userId) {
        throw new Error("You are not the owner of this rental request.");
    }

    if (rentalRequest.status !== 'APPROVED') {
        throw new Error("Rental request is not approved.");
    }

    if (rentalRequest.payment?.status === "COMPLETED") {
        throw new Error("Payment already completed.");
    }

    if (rentalRequest.payment?.status === "PENDING") {
        await prisma.payment.delete({
            where: {
                rentalRequestId: rentalRequest.id
            }
        });
    }

    const session = await stripe.checkout.sessions.create({

        mode: "payment",
        payment_method_types: ["card"],

        line_items: [
            {
                quantity: 1,

                price_data: {
                    currency: "bdt",
                    unit_amount: rentalRequest.property.rentAmount * 100,

                    product_data: {
                        name: rentalRequest.property.title,
                        description: rentalRequest.property.description
                    }
                }
            }
        ],

        success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url: `${config.app_url}/payment/cancel`,

        metadata: {
            rentalRequestId: rentalRequest.id
        }

    })

    await prisma.payment.create({

        data: {

            rentalRequestId: rentalRequest.id,

            amount: rentalRequest.property.rentAmount,

            provider: "STRIPE",

            status: "PENDING"

        }

    })

    return {
        checkoutUrl: session.url
    }

}

const confirmPayment = async (payload: Buffer, signature: string) => {

    // console.log("Webhook received");
    const stripeEndpointSecret = config.stripe_webhook_secret;

    if (!stripeEndpointSecret) {
        throw new Error("Stripe webhook secret is missing.");
    }

    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        stripeEndpointSecret
    );

    switch (event.type) {

        case "checkout.session.completed":
            await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
            break;
    }

    return {
        received: true
    };
};

export const paymentServices = {
    createPaymentSession,
    confirmPayment
}