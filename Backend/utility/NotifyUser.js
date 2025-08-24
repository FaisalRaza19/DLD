import { Notification } from "../Models/notification.model.js";

export const notifyUsers = async (io, recipientsUserIds, payload) => {
    for (const uid of recipientsUserIds) {
        try {
            io.to(`user:${uid}`).emit("notification", payload);

            await Notification.create({
                user: uid,
                type: payload.type,
                title: payload.title,
                body: payload.body,
                meta: payload.meta
            });
        } catch (e) {
            console.error("Notification error:", e.message);
        }
    }
};
