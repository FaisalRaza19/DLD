import { Lawyers } from "./Api's";

// get all lawyers of user law firm
export const getLawyers = async () => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(Lawyers.getLawyers, {
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

// add lawyer
export const addLawyer = async (formData) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(Lawyers.createLawyer, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
            credentials: 'include'
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

// edit lawyer
export const editLawyer = async ({ formData }) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(Lawyers.editLawyer, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
            credentials: 'include'
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

// del lawyer
export const delLawyer = async ({ lawyerId }) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(Lawyers.delLawyer, {
            method: "DELETE",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ lawyerId }),
            credentials: 'include'
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
