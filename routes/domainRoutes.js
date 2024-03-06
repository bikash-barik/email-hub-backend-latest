import express from "express";

import {
  AutoEmailValid,
  AutodomainCountry,
  AutoextractEmail,
  domainCountry,
} from "../controllers/domainController.js";
import { extractEmail } from "../controllers/domainController.js";
import { validateEmail } from "../controllers/domainController.js";
import { uploadFile } from "../controllers/domainController.js";
import uploadEmails from "./../controllers/sendemail.js";

const router = express.Router();

router.route("/").post(uploadFile);
router.route("/domainCountry").post(domainCountry);
router.route("/autodomainCountry").post(AutodomainCountry);
router.route("/extractEmail").post(extractEmail);
router.route("/autoextractEmail").post(AutoextractEmail);
router.route("/validateEmail").post(validateEmail);
router.route("/autovalidateEmail").post(AutoEmailValid);
router.route("/emailsend").post(uploadEmails);

export default router;
