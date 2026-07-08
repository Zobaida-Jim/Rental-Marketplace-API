import { RentalRequestStatus } from "../../../generated/prisma/client.js"

export interface ICreateRentPayload {
    title: string,
    description: string,
    address: string,
    location: string,
    rentAmount: number,
    categoryName: string
}

export interface IUpdateRentPayload {
    title?: string,
    description?: string,
    address?: string,
    location?: string,
    rentAmount?: number,
    categoryName?: string
}

export interface IStatusApprovedOrRejectPayload {
    status: RentalRequestStatus
}