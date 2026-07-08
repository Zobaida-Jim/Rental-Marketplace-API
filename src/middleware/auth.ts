import { NextFunction, Request, Response } from "express";
import { ActiveStatus, Role } from "../../generated/prisma/enums.js";
import { catchAsync } from "../utils/catchAsync.js";
import { jwtUtils } from "../utils/jwt.js";
import config from "../config/index.js";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";


declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string
                name: string;
                id: string;
                role: Role;
            }
        }
    }
}

export const auth = (...requiredRoles: Role[]) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const token = req.cookies.accessToken ?
                req.cookies.accessToken :
                req.headers.authorization?.startsWith("Bearer ") ?
                    req.headers.authorization?.split(" ")[1] :
                    req.headers.authorization

            if (!token) {
                throw new Error("You are not logged in. Please login first to access this resources.");
            }

            const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret)
            if (!verifiedToken.success) {
                throw new Error(verifiedToken.message);
            }

            const { id, email, name, role } = verifiedToken.data as JwtPayload;

            if (requiredRoles.length && !requiredRoles.includes(role)) {
                throw new Error("Forbidden. You don't have permission to access this !");
            }
            //console.log("JWT:", verifiedToken.data);

            const user = await prisma.user.findUnique({
                where: {
                    id
                },
            });

            //console.log("DB User:", user);
            if (!user) {
                throw new Error("User not found!!!");
            }

            if (user.activeStatus === ActiveStatus.DELETED) {
                throw new Error("This account has been deleted.");
            }

            if (user.activeStatus === ActiveStatus.BLOCKED) {
                throw new Error("User is blocked, please contact support team.");
            }

            if (requiredRoles.length && !requiredRoles.includes(user.role)) {
                throw new Error("Forbidden. You don't have permission to access this!");
            }

            req.user = {
                id,
                name,
                email,
                role
            }

            next()
        })

}