import moment from "moment-timezone";
import { Hearing } from "../Models/Hearings.model.js";
import { User } from "../Models/User.model.js";
import { notifyUsers } from "./NotifyUser.js";
import { resolveRecipientsUserIds } from "./hearingUtils.js";

export default function registerHearingJobs(agenda, io) {
  // Job 1: Reminder a certain number of minutes before the hearing.
  agenda.define("send-hearing-reminder", async (job) => {
    const { hearingId } = job.attrs.data;

    const hearing = await Hearing.findById(hearingId).populate("caseId");
    if (!hearing || !hearing.notify) return;

    const caseDoc = hearing.caseId;
    const recipients = await resolveRecipientsUserIds(caseDoc, hearing);

    await notifyUsers(io, recipients, {
      title: `Reminder: Hearing - ${hearing.title}`,
      body: `Starts at ${hearing.startsAt.toLocaleString()} • ${hearing.courtLocation}`,
      type: "hearing_reminder",
      meta: { caseId: String(caseDoc?._id), hearingId: String(hearing._id) },
    });
  });

  // Job 2: Day-of 8:00 AM LOCAL TIME per user.
  agenda.define("send-hearing-day-8am-per-user", async (job) => {
    const { hearingId, userId } = job.attrs.data;

    const hearing = await Hearing.findById(hearingId).populate("caseId");
    if (!hearing || !hearing.notify) return;

    const caseDoc = hearing.caseId;
    const user = await User.findById(userId).select("timezone");
    const tz = user?.timezone || "UTC";

    await notifyUsers(io, [String(userId)], {
      title: `Today: Hearing - ${hearing.title}`,
      body: `Case: ${caseDoc?.caseTitle || "N/A"} • ${hearing.courtLocation} • ${moment(hearing.startsAt).tz(tz).format("LLLL")}`,
      type: "hearing_today",
      meta: { caseId: String(caseDoc?._id), hearingId: String(hearing._id) },
    });
  });

  // Job 3: Post-hearing follow-up next-day 8:00 AM LOCAL TIME per user.
  agenda.define("send-post-hearing-followup", async (job) => {
    const { hearingId, userId } = job.attrs.data;

    const hearing = await Hearing.findById(hearingId).populate("caseId");
    if (!hearing) return;

    const caseDoc = hearing.caseId;
    const user = await User.findById(userId).select("timezone");
    const tz = user?.timezone || "UTC";

    await notifyUsers(io, [String(userId)], {
      title: `Follow-up: ${hearing.title}`,
      body: `Please remember to post an update for the hearing at ${hearing.courtLocation} on ${moment(hearing.startsAt).tz(tz).format("LLLL")}.`,
      type: "hearing_follow_up",
      meta: { caseId: String(caseDoc?._id), hearingId: String(hearing._id) },
    });
  });
}
