import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

const app = express();
const PORT = 5000;

// ---------- Middleware ----------
app.use(express.json());
app.use(cors());

// ---------- MongoDB Atlas URI ----------
const MONGO_URI =
  "mongodb+srv://kanni001:12345@cluster0.agefew9.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0";

// ---------- MongoDB Connection with Reconnect Logic ----------
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected! Retrying...");
  connectDB();
});

// ---------- Credential Model ----------
const credential = mongoose.model("credential", {}, "bulkmail");

// ---------- Email Sending Route ----------
app.post("/sendmail", async (req, res) => {
  const { msg, emailList } = req.body;

  if (!msg || !emailList || !Array.isArray(emailList) || emailList.length === 0) {
    return res.status(400).send("❌ Missing message or email list.");
  }

  try {
    const data = await credential.find();
    const creds = data[0]?.toJSON();

    if (!creds || !creds.user || !creds.pass) {
      return res.status(500).send("❌ Email credentials not found.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: creds.user,
        pass: creds.pass,
      },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: creds.user,
        to: emailList[i],
        subject: "A message from Bulk Mail App!",
        text: msg,
      });
    }

    res.send(true);
  } catch (error) {
    console.error("❌ Mail send error:", error);
    res.status(500).send(false);
  }
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
  connectDB();
});
