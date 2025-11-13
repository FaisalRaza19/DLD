import { userAuth } from "./Api's.js"

export const register = async (formData) => {
    try {
        localStorage.setItem("email", formData.email)
        const response = await fetch(userAuth.register, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: "include"
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { message: errorDetails.message.message || errorDetails.message };
        }
        const data = await response.json();
        return data
    } catch (error) {
        return error.message
    }
}

// Updated CodeVerify Function
export const verify_register = async ({ code }) => {
    try {
        const response = await fetch(userAuth.verify_register, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { message: errorDetails.message };
        }

        const data = await response.json();
        localStorage.setItem("dld_user_token", data.accesstoken);
        return data;
    } catch (error) {
        return error.message;
    }
};

// resend code 
export const ResendCode = async () => {
    try {
        const response = await fetch(userAuth.resendCode, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return errorDetails;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return error.message
    }
};

// login user
export const Login = async ({ formData }) => {
    try {
        const response = await fetch(userAuth.login, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            credentials: "include"
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return errorDetails;
        }

        const data = await response.json();
        localStorage.setItem("dld_user_token", data?.accesstoken)
        return data;
    } catch (error) {
        return error.message;
    }
};

// LogOut User
export const LogOut = async () => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(userAuth.logOut, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { message: errorDetails.message };
        }
        const data = await response.json();
        localStorage.removeItem("dld_user_token");
        return data;
    } catch (error) {
        return error.message;
    }
};

// fetch User
export const getUser = async () => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(userAuth.getUser, {
            method: "GET",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { message: errorDetails.message };
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return error.message;
    }
};

// update avatar
export const updateAvatar = async (file) => {
    if (!file) {
        return { message: "Please select a file to upload." };
    }
    try {
        const token = localStorage.getItem("dld_user_token");
        const formData = new FormData();
        formData.append("avatar", file);
        const response = await fetch(userAuth.updateAvatar, {
            method: "POST",
            headers: {
                "Authorization": token,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { message: errorDetails.message };
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return error.message;
    }
};

// verify jwt
export const verifyJWT = async (setIsVerify) => {
    try {
        const token = localStorage.getItem("dld_user_token");
        if (!token || token === "undefined" || token === null) {
            setIsVerify(false)
            localStorage.removeItem("dld_user_token");
        }
        const response = await fetch(userAuth.verifyJWT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { message: errorDetails.message }
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return error.message;
    }
};

// edit profile
export const editProfile = async ({ userData }) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(userAuth.editProfile, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify(userData),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { message: errorDetails.message };
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return error.message;
    }
};

// verify and update profile 
export const verifyAndUpdateProfile = async ({ code }) => {
    try {
        const token = localStorage.getItem("dld_user_token");
        const response = await fetch(userAuth.verify_edit, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify({ code }),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { message: errorDetails.message };
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return error.message;
    }
}

// forget password
export const forgetPass = async ({ email }) => {
    try {
        localStorage.removeItem("dld_user_token");
        const response = await fetch(userAuth.email_pass, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to forget pass");
        }

        return data
    } catch (error) {
        return error.message
    }
};

// update pass word 
export const updatePassword = async ({ new_pass, token }) => {
    try {
        // localStorage.removeItem("dld_user_token");
        const response = await fetch(`${userAuth.update_pass}/${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ new_pass }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to forget pass");
        }

        return data
    } catch (error) {
        return error.message;
    }
};
