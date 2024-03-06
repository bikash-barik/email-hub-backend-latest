// controllers/EmailController.js
import csv from "csv-parser";
import exceljs from "exceljs";
import nodemailer from "nodemailer";
import Email from "./../models/emailSendModal.js";

// POST /upload
const uploadEmails = async (req, res) => {
  try {
    const { subject, mailContent, emailid, password } = req.body;

    const files = req.files;

    console.log("files",files, req.files,req.body);
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ message: "No files were uploaded." });
    }

    const emailSheet = files.emailSheet;
    const emailSheetUploadPath = __dirname + "/uploads/" + emailSheet.name;

    await emailSheet.mv(emailSheetUploadPath);

    const workbook = new exceljs.Workbook();
    const emailSheetData = [];

    if (emailSheet.name.endsWith(".csv")) {
      // Read CSV file
      const stream = fs
        .createReadStream(emailSheetUploadPath)
        .pipe(csv())
        .on("data", (row) => {
          emailSheetData.push({
            domain: row.domain.trim(),
            email: row.email.trim(),
          });
        });

      await new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);
      });
    } else if (emailSheet.name.endsWith(".xlsx")) {
      // Read Excel file
      await workbook.xlsx.readFile(emailSheetUploadPath);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row) => {
        const domain = row.getCell(1).toString().trim();
        const email = row.getCell(2).toString().trim();

        emailSheetData.push({ domain, email });
      });
    } else {
      return res.status(400).json({ message: "Invalid file format." });
    }

    // Save email data to database
    await Email.create(emailSheetData);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailid,
        pass: password,
      },
    });

    for (let i = 0; i < emailSheetData.length; i++) {
      const { domain, email } = emailSheetData[i];

      const options = {
        from: emailid,
        to: email,
        subject: `Re: ${domain} - ${subject}`,
        text: `Hi ${domain},\n\n${mailContent}`,
      };

      await transporter.sendMail(options);
      console.log("Success: " + options.to);
    }

    return res.status(200).json({
      message: "Emails sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
      message: "Internal Server Error",
    });
  }
};

export default uploadEmails;
