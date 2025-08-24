import { User } from "../Models/User.model.js";

const separators = ["", ".", "_", "-", "$", "@"];
const digits = "0123456789";

function getRandomSeparator() {
    return separators[Math.floor(Math.random() * separators.length)];
}

function getRandomDigit() {
    return digits[Math.floor(Math.random() * digits.length)];
}

export const generateUniqueUserName = async (fullName) => {
    const nameParts = fullName
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .map(part => part.replace(/[^a-z0-9]/g, ""));

    let baseUserName = "";
    if (nameParts.length === 1) {
        baseUserName = nameParts[0].slice(0, 15);
    } else {
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        const sep = getRandomSeparator();

        baseUserName = (firstName + sep + lastName).slice(0, 15);
    }

    // Ensure min length 3
    if (baseUserName.length < 3) {
        baseUserName = baseUserName.padEnd(3, "x");
    }

    // Ensure at least one special char (if not present, insert one)
    if (!/[._\-$@]/.test(baseUserName)) {
        baseUserName = baseUserName + getRandomSeparator();
    }

    // Ensure at least one number (if not present, insert one)
    if (!/\d/.test(baseUserName)) {
        baseUserName = baseUserName + getRandomDigit();
    }

    // Limit to 15 chars max
    baseUserName = baseUserName.slice(0, 15);

    let uniqueUserName = baseUserName;
    let counter = 1;

    while (await User.exists({ userName: uniqueUserName })) {
        const suffix = counter.toString();
        const allowedLength = 15 - suffix.length;
        uniqueUserName = baseUserName.slice(0, allowedLength) + suffix;
        counter++;

        if (counter > 1000) {
            throw new Error("Unable to generate unique username");
        }
    }

    return uniqueUserName;
};
