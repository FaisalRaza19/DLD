import { Lawyers } from "../Models/Lawyer.model.js";
import { Clients } from "../Models/Client.model.js";

// Convert Lawyer._id -> User._id for notifications
export async function lawyerToUserId(lawyerId) {
    if (!lawyerId) return null;
    const lawyer = await Lawyers.findById(lawyerId).select("user");
    return lawyer?.user || null;
}

// Build recipients: case owner, client.user, primary lawyer.user, subHandler.user
export async function resolveRecipientsUserIds(caseDoc, hearing) {
    const ids = new Set();

    if (caseDoc?.caseHandler) ids.add(String(caseDoc?.caseHandler));

    if (caseDoc?.client) {
        const client = await Clients.findById(caseDoc.client).select("user");
        if (client?.user) ids.add(String(client?.user));
    }

    if (caseDoc?.lawyer) {
        const u = await lawyerToUserId(caseDoc.lawyer);
        if (u) ids.add(String(u));
    }

    if (hearing?.subHandler) {
        const u = await lawyerToUserId(hearing.subHandler);
        if (u) ids.add(String(u));
    }

    return [...ids];
}
