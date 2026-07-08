import { ActiveStatus } from "../../generated/prisma/enums.js";

export const blockedStatus = (status: ActiveStatus) => {
    if (status === 'BLOCKED') {
        throw new Error("You are blocked now. Please contatct with support team.");
    }
}