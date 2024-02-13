import express from "express";
// import { protect } from "../../middleware/authMiddleware.js";
import {uploadFile} from "../../controllers//domainController.js";
import {domainCountry} from "../controllers/domainController.js";
import {extractEmail} from "../controllers/domainController.js";
import {validateEmail} from "../controllers/domainController.js";
import { uploadFile } from "../controllers/domainController.js";

const router = express.Router();

router.route("/").post(uploadFile);
router.route("/domainCountry").post(domainCountry);
router.route("/extractEmail").post(extractEmail);
router.route("/validateEmail").post(validateEmail);

export default router;