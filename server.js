import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import subUserRoutes from "./routes/subUserRoutes.js";
import domainRoutes from "./routes/domainRoutes.js";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import multer from "multer";
// import fileUpload from "express-fileupload";

dotenv.config();

connectDB();

const app = express(); // main thing
app.use(cors());

app.use(express.json());
// app.use(fileUpload());
app.use("/api/users", userRoutes);
app.use("/api/subUsers", subUserRoutes);
app.use("/api/domain", domainRoutes);

// --------------------------deployment------------------------------
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}
// --------------------------deployment------------------------------

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });

// Your other routes and middleware configurations...

// Route for handling file uploads
app.post("/upload", upload.single("emailSheet"), (req, res) => {
  // Now you can access the uploaded file via req.file
  console.log(req.file);
  // Your file handling logic goes here
});

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}..`.yellow
      .bold
  )
);
