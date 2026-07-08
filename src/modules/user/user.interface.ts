import { Role } from "../../../generated/prisma/enums.js";

export interface IRegisterInfoPayload {
    email: string,
    name: string,
    password: string,
    role?: Role,
}

export interface ILoginPayload {
    email: string,
    password: string
}

export interface IUpdateProfile {
    name?: string,
    password?: string,
}