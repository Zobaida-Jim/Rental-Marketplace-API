import { prisma } from "../../lib/prisma.js";
import { ILoginPayload, IRegisterInfoPayload, IUpdateProfile } from "./user.interface.js"
import bcrypt from "bcryptjs";
import config from "../../config/index.js";
import { jwtUtils } from "../../utils/jwt.js";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { ActiveStatus } from "../../../generated/prisma/enums.js";

const registerUser = async (payload: IRegisterInfoPayload) => {
    const { email, name, password, role } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            email
        }
    })
    if (isUserExist) {
        throw new Error("User with this email already exist !");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_round))

    await prisma.user.create({
        data: {
            email: email,
            name: name,
            password: hashedPassword,
            role: role
        }
    })

    const user = await prisma.user.findFirstOrThrow({
        where: {
            email,
            name
        },
        omit: {
            password: true
        }
    })

    return user;
}

const loginUser = async (payload: ILoginPayload) => {
    const { email, password } = payload;

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    })

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
        throw new Error("Password is incorrect. Please enter correct passowrd.");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    )

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions
    )

    return {
        accessToken, refreshToken
    }
}

const getMyInfo = async (userId: string) => {
    const userInfo = await prisma.user.findFirstOrThrow({
        where: {
            id: userId
        },
        omit: {
            password: true
        }
    })

    return userInfo;
}

const updateMyProfile = async (userId: string, payload: IUpdateProfile) => {

    if (!payload) {
        throw new Error("Please enter the request body, 'name' or 'passord' ")
    }

    const { name, password } = payload;
    let hashedPassword;
    if (password) {
        hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_round));
    } else {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userId
            }
        })

        hashedPassword = user.password;
    }
    const updatedProfile = await prisma.user.update({
        where: {
            id: userId
        }, data: {
            name,
            password: hashedPassword
        },
        omit: {
            password: true
        }
    })
    return updatedProfile;
}

const refreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret);
    if (!verifiedRefreshToken.success) {
        throw new Error(verifiedRefreshToken.message);
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findFirstOrThrow({
        where: { id }
    });

    if (user.activeStatus === "BLOCKED") {
        throw new Error("User is Blocked!")
    }

    const jwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions
    );

    return { accessToken }
}

const deleteMyProfile = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
    });

    if (user.role === 'TENANT') {
        const updatedTenant = await prisma.user.update({
            where: { id: userId },
            data: {
                activeStatus: ActiveStatus.DELETED,
                name: "Deleted Profile",
                email: `deleted__${user.id}@deleted.local`,
            },
        });

        return updatedTenant;
    }

    const deletedUser = await prisma.user.delete({
        where: {
            id: userId,
        },
    });

    return null;
};

export const userServices = {
    registerUser,
    loginUser,
    getMyInfo,
    updateMyProfile,
    refreshToken,
    deleteMyProfile
}