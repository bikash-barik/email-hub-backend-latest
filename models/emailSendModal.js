import mongoose from "mongoose";

// Define the schema
const emailSchema = new mongoose.Schema({
  domain: String,
  email: String,
});

// Export the model
export default mongoose.model("Email", emailSchema);