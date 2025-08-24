import { Router } from "express"
import { upload } from "../Middleware/Multer.js";
import { verify_token } from "../Middleware/auth.js";
import {
    createCase, editCase, delCase, updateStatus,getCases, getCase, restoreCaseFiles
} from "../Controller/case.controller.js"

export const Case = Router()

Case.route("/createCase").post(upload.fields([{ name: "docs", maxCount: 10, }]), verify_token, createCase)
Case.route("/editCase/:caseId").post(upload.fields([{ name: "docs", maxCount: 10, }]), verify_token, editCase)
Case.route("/delCase").delete(upload.none(), verify_token, delCase)
Case.route("/updateStatus").post(upload.none(), verify_token, updateStatus)
Case.route("/getCases").get(upload.none(), verify_token, getCases)
Case.route("/getCase/:id").get(upload.none(), verify_token, getCase)
Case.route("/restoreDocs").post(upload.none(), verify_token, restoreCaseFiles)