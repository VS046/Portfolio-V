const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password for Gmail
  },
});

// Contact Route
app.post("/api/contact", (req, res) => {
  const { user_name, user_email, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER, // Must be your authenticated email
    to: process.env.NOTIFICATION_EMAIL,
    replyTo: user_email, // This allows you to click 'Reply' in your email to respond to the visitor
    subject: `🚀 Portfolio Message: ${user_name}`,
    text:
      `You have a new message from your portfolio:\n\n` +
      `Name: ${user_name}\n` +
      `Email: ${user_email}\n\n` +
      `Message:\n${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending mail:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
    console.log("Email sent: " + info.response);
    res
      .status(200)
      .json({ success: true, message: "Message Sent Successfully!" });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
