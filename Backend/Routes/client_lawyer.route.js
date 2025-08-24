import { Router } from "express";
import {
    createClient, editClient, delClient, getClient, createLawyer, editLawyer, delLawyer, getLawyer
} from "../Controller/client_lawyer.controller.js"
import { upload } from "../Middleware/Multer.js";
import { verify_token } from "../Middleware/auth.js";

export const subUser = Router();
subUser.route("/createClient").post(upload.none(), verify_token, createClient)
subUser.route("/editClient").post(upload.none(), verify_token, editClient)
subUser.route("/delClient").delete(upload.none(), verify_token, delClient)
subUser.route("/getClient").get(upload.none(), verify_token, getClient)
// lawyer
subUser.route("/createLawyer").post(upload.none(), verify_token, createLawyer)
subUser.route("/editLawyer").post(upload.none(), verify_token, editLawyer)
subUser.route("/delLawyer").delete(upload.none(), verify_token, delLawyer)
subUser.route("/getLawyer").get(upload.none(), verify_token, getLawyer)