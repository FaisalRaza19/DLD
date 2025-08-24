import moment from "moment-timezone";
import agenda from "../utility/agenda.js";

import { Hearing } from "../Models/Hearings.model.js";
import { Case } from "../Models/case.model.js";
import { User } from "../Models/User.model.js";
import { Notification } from "../Models/notification.model.js";
import { notifyUsers } from "../utility/NotifyUser.js";
import { resolveRecipientsUserIds } from "../utility/hearingUtils.js";

async function scheduleAllForHearing(hearing, caseDoc, io) {
    await agenda.cancel({ "data.hearingId": String(hearing._id) });
    if (!hearing.notify) {
        return;
    }

    const now = moment();
    const recipients = await resolveRecipientsUserIds(caseDoc, hearing);

    // 1) Schedule the pre-hearing reminder.
    if (hearing.reminderOffsetMinutes) {
        const reminderTime = moment(hearing.startsAt).subtract(hearing.reminderOffsetMinutes, "minutes");
        if (reminderTime.isAfter(now)) {
            const jobData = { hearingId: String(hearing._id) };
            await agenda.schedule(reminderTime.toDate(), "send-hearing-reminder", jobData);
        }
    }

    for (const uid of recipients) {
        const user = await User.findById(uid).select("timezone");
        const tz = user?.timezone || "UTC";

        const local8am = moment.tz(hearing.startsAt, tz)
            .startOf("day")
            .hour(8)
            .minute(0)
            .second(0)
            .millisecond(0);

        const runAt8am = local8am.toDate();
        if (moment(runAt8am).isAfter(now)) {
            await agenda.schedule(runAt8am, "send-hearing-day-8am-per-user", {
                hearingId: String(hearing._id),
                userId: String(uid),
            });
        }

        // b) Post-hearing follow-up notification at local 8:00 AM the next day.
        const nextDay8am = local8am.add(1, "day");
        const runAtNextDay8am = nextDay8am.toDate();
        if (moment(runAtNextDay8am).isAfter(now)) {
            await agenda.schedule(runAtNextDay8am, "send-post-hearing-followup", {
                hearingId: String(hearing._id),
                userId: String(uid),
            });
        }
    }
}

// add hearing
export const addHearing = async (req, res) => {
    try {
        const io = req.app.get("io");
        const hearingData = {
            ...req.body,
            caseHandler: req.user._id,
        };

        const newHearing = new Hearing(hearingData);
        await newHearing.save();

        const caseDoc = await Case.findById(newHearing.caseId);
        await scheduleAllForHearing(newHearing, caseDoc, io);

        const recipients = await resolveRecipientsUserIds(caseDoc, newHearing);
        await notifyUsers(io, recipients, {
            title: "New Hearing Created",
            body: `A new hearing '${newHearing.title}' has been scheduled.`,
            type: "hearing_created",
            meta: { caseId: String(newHearing.caseId), hearingId: String(newHearing._id) },
        });

        return res.status(200).json({ statusCode: 200, message: "Hearing created successfully", data: newHearing });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Error creating hearing", error: error.message });
    }
};

// edit hearing
export const editHearing = async (req, res) => {
    try {
        const io = req.app.get("io");
        const { hearingId, ...updateData } = req.body;
        const updatedHearing = await Hearing.findByIdAndUpdate(hearingId, updateData, { new: true });

        if (!updatedHearing) {
            return res.status(400).json({ statusCode: 400, message: "Hearing not found" });
        }

        const caseDoc = await Case.findById(updatedHearing.caseId);
        await scheduleAllForHearing(updatedHearing, caseDoc, io);

        const recipients = await resolveRecipientsUserIds(caseDoc, updatedHearing);
        await notifyUsers(io, recipients, {
            title: "Hearing Updated",
            body: `The hearing '${updatedHearing.title}' has been updated.`,
            type: "hearing_updated",
            meta: { caseId: String(updatedHearing.caseId), hearingId: String(updatedHearing._id) },
        });

        return res.status(200).json({ statusCode: 200, message: "Hearing updated successfully", data: updatedHearing });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Error updating hearing", error: error.message });
    }
};

// del hearing
export const deleteHearing = async (req, res) => {
    try {
        const io = req.app.get("io");
        const { hearingId } = req.body;

        const deletedHearing = await Hearing.findByIdAndDelete(hearingId);
        if (!deletedHearing) {
            return res.status(400).json({ statusCode: 400, message: "Hearing not found" });
        }

        // Cancel all pending jobs for this hearing
        await agenda.cancel({ "data.hearingId": String(hearingId) });

        const caseDoc = await Case.findById(deletedHearing.caseId);
        const recipients = await resolveRecipientsUserIds(caseDoc, deletedHearing);
        await notifyUsers(io, recipients, {
            title: "Hearing Deleted",
            body: `The hearing '${deletedHearing.title}' was removed.`,
            type: "hearing_deleted",
            meta: { caseId: String(deletedHearing.caseId), hearingId: String(deletedHearing._id) },
        });

        return res.status(200).json({ statusCode: 200, message: "Hearing deleted successfully" });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Error deleting hearing", error: error.message });
    }
};

// get case hearings
export const getCaseHearings = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        const hearings = await Hearing.find({ caseHandler: userId })
            .populate("caseId", "caseTitle status")
            .populate("subHandler", "fullName email")
            .sort({ startsAt: 1 });

        return res.status(200).json({ statusCode: 200, message: "Hearings fetched successfully", data: hearings });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Error fetching hearings", error: error.message });
    }
};

// get all notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Unauthorized" });
        }

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({ statusCode: 200, message: "Notifications fetched successfully", data: notifications });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Error fetching notifications", error: error.message });
    }
};

// Mark a notification as read
export const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { notificationId } = req.body;
        if (!userId || !notificationId) {
            return res.status(400).json({ statusCode: 400, message: "Invalid request" });
        }

        // Find and update the notification
        const updatedNotification = await Notification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { isRead: true },
            { new: true }
        );

        if (!updatedNotification) {
            return res.status(400).json({ statusCode: 400, message: "Notification not found or unauthorized" });
        }

        return res.status(200).json({ statusCode: 200, message: "Notification marked as read", data: updatedNotification });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Error updating notification", error: error.message });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { notificationId } = req.body;
        if (!userId || !notificationId) {
            return res.status(400).json({ statusCode: 400, message: "Invalid request" });
        }

        // Find and delete the notification
        const deletedNotification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });

        if (!deletedNotification) {
            return res.status(400).json({ statusCode: 400, message: "Notification not found or unauthorized" });
        }

        return res.status(200).json({ statusCode: 200, message: "Notification deleted successfully" });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, message: "Error deleting notification", error: error.message });
    }
};
