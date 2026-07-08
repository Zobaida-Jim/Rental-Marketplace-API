import { ActiveStatus } from "../../../generated/prisma/enums.js";

export interface IUpdateUserStatusPayload {
    status: ActiveStatus
}