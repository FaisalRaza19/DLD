import { Router } from "express";
import {
    addHearing, editHearing, deleteHearing, getCaseHearings, getNotifications,
    markNotificationRead, deleteNotification
} from "../Controller/hearings.controller.js";
import { upload } from "../Middleware/Multer.js";
import { verify_token } from "../Middleware/auth.js";

export const hearing = Router();

hearing.route("/createHearing").post(upload.none(), verify_token, addHearing);
hearing.route("/editHearing").post(upload.none(), verify_token, editHearing);
hearing.route("/deleteHearing").delete(upload.none(), verify_token, deleteHearing);
hearing.route("/getCaseHearings").get(verify_token, getCaseHearings);
hearing.route("/getNotifications").get(verify_token, getNotifications);
hearing.route("/markNotificationRead").patch(verify_token, markNotificationRead);
hearing.route("/deleteNotification").delete(verify_token, deleteNotification);
