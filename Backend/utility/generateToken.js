import jwt from "jsonwebtoken";

export const generate_accessToken = (payload) => {
    const accessToken = jwt.sign(
        { id: payload },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
    return accessToken
}

export const generate_refreshToken = (payload) => {
    const refreshToken = jwt.sign(
        { id: payload },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
    return refreshToken
}

export const generate_passToken = (payload) => {
    const passToken = jwt.sign(
        { id: payload, },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
    return passToken
}