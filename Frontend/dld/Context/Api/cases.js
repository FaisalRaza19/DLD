import { cases } from "./Api's";

// get all cases of user
export const getCases = async () => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(cases.getCases, {
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

// get case
export const getCase = async (id) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(`${cases.getCase}/${id}`, {
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

// add case
export const addCase = async (formData) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(cases.createCase, {
            method: "POST",
            headers: {
                "Authorization": token,
            },
            body: formData,
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, statusCode: response.status, error: data.message || "Failed to create case" };
        }
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// edit case
export const editCase = async (caseId, formData) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(`${cases.editCase}/${caseId}`, {
            method: "POST",
            headers: {
                "Authorization": token,
            },
            body: formData,
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, statusCode: response.status, error: data.message || "Failed to update case" };
        }

        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// del case 
export const delCase = async ({ caseId }) => {
    try {
        const token = localStorage.getItem("dld_user_token");
        const response = await fetch(cases.delCase, {
            method: "DELETE",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ caseId }),
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, statusCode: response.status, error: data.message || "Failed to update case" };
        }

        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// change status
export const changeStatus = async (payload) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(cases.changeStatus, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, statusCode: response.status, error: data.message || "Failed to update case" };
        }

        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// restore files
export const restoreFiles = async (payload) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(cases.restoreDocs, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            credentials: "include",
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, statusCode: response.status, error: data.message || "Failed to update case" };
        }

        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

