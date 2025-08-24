import { Clients } from "./Api's";

// get all clients of user
export const getClients = async () => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(Clients.getClients, {
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
export const addClient = async (formData) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(Clients.createClient, {
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

// edit client
export const editClient = async ({ formData }) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(Clients.editClient, {
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

// del client 
export const dellClient = async ({ clientId }) => {
    try {
        const token = localStorage.getItem("dld_user_token");

        const response = await fetch(Clients.delClient, {
            method: "DELETE",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({clientId}),
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
