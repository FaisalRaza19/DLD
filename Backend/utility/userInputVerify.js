import { isValidPhoneNumber } from "react-phone-number-input";

export const verifyUserData = (data) => {
    const errors = [];

    // Verify Email (only if given)
    if ("email" in data) {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(data.email)) {
            errors.push("Invalid email format.");
        }
    }

    // Verify Full Name (only if given)
    if ("fullName" in data) {
        if (!data.fullName || data.fullName.trim().length < 3) {
            errors.push("Full name must be at least 3 characters.");
        }
    }

    // Verify Password (only if given)
    if ("password" in data) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
        if (!passwordRegex.test(data.password)) {
            errors.push(
                "Password must be at least 8 characters long, with 1 uppercase, 1 lowercase, 1 number, and 1 special character."
            );
        }
    }

    // Role-based checks (only if given)
    if ("role" in data) {
        if (data.role === "lawyer") {
            if ("totalLawyer" in data && data.totalLawyer != null) {
                errors.push("Lawyer role should not include totalLawyer field.");
            }
        }

        if (data.role === "law firm") {
            if (!("totalLawyer" in data) || isNaN(data.totalLawyer) || data.totalLawyer < 0) {
                errors.push("Law firm role must include a valid totalLawyer number.");
            }
        }
    }

    // Verify Phone Number (only if given)
    if ("phoneNumber" in data) {
        if (!isValidPhoneNumber(data.phoneNumber)) {
            errors.push("Invalid phone number format.");
        }
    }

    // Verify Address (only if given)
    if ("address" in data) {
        if (!data.address || data.address.trim().length < 5) {
            errors.push("Address must be at least 5 characters long.");
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
