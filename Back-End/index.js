import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ramyakanniyappan011@gmail.com",
    pass: "xftb scvg bzbe evxv", // Use app password, not your actual password
  },
});

// Email sending route
app.post("/sendmail", async (req, res) => {
  const { msg, emailList } = req.body;

  if (!msg || !emailList || emailList.length === 0) {
    return res.status(400).send("Missing message or email list.");
  }

  try {
    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: "ramyakanniyappan011@gmail.com",
        to: emailList[i],
        subject: "A message from Bulk Mail App!",
        text: msg,
      });
    }
    res.send(true);
  } catch (error) {
    console.error(error);
    res.status(500).send(false);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
