import { Hearings } from "./Api's";

// get hearings
export const getHearings = async () => {
    try {
        const token = localStorage.getItem("dld_user_token");
        const response = await fetch(Hearings.getHearings, {
            method: "GET",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { type: "error", message: errorDetails.message };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return "Failed to fetch hearings"
    }
};

export const addHearing = async (formData) => {
    try {
        const token = localStorage.getItem("dld_user_token");
        const response = await fetch(Hearings.addHearing, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { type: "error", message: errorDetails.message };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { statusCode: 500, message: "Failed to add hearing" };
    }
};

export const editHearing = async (formData) => {
    try {
        const token = localStorage.getItem("dld_user_token");
        const response = await fetch(Hearings.editHearing, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { type: "error", message: errorDetails.message };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { statusCode: 500, message: "Failed to edit hearing" };
    }
};

export const delHearing = async ({ hearingId }) => {
    try {
        const token = localStorage.getItem("dld_user_token");
        const response = await fetch(Hearings.delHearing, {
            method: "DELETE",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ hearingId }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { type: "error", message: errorDetails.message };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { statusCode: 500, message: "Failed to delete hearing" };
    }
};

// get notifications
export const getNotifications = async () => {
    try {
        const token = localStorage.getItem("dld_user_token");
        const response = await fetch(Hearings.getNotifications, {
            method: "GET",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { type: "error", message: errorDetails.message };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { statusCode: 500, message: "Failed to fetch notifications" };
    }
};

// mark a notification as read
export const markNotificationRead = async (notificationId) => {
    try {
        const token = localStorage.getItem("dld_user_token");
        const response = await fetch(Hearings.markNotificationRead, {
            method: "PATCH",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ notificationId }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { type: "error", message: errorDetails.message };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { statusCode: 500, message: "Failed to mark notification as read" };
    }
};

// delete a notification
export const deleteNotification = async (notificationId) => {
    try {
        const token = localStorage.getItem("dld_user_token");
        const response = await fetch(Hearings.deleteNotification, {
            method: "DELETE",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ notificationId }),
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            return { type: "error", message: errorDetails.message };
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return { statusCode: 500, message: "Failed to delete notification" };
    }
};
