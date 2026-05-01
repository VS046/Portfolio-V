const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.set("trust proxy", 1); // Allow Express to trust the reverse proxy (like Render's load balancer) to get real client IP
const PORT = process.env.PORT || 5000;

// Custom Rate Limiter (No external dependency)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // limit each IP to 5 requests per window

const customRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: currentTime });
    return next();
  }

  const requestData = rateLimitMap.get(ip);
  if (currentTime - requestData.startTime > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, startTime: currentTime });
    return next();
  }

  if (requestData.count >= MAX_REQUESTS) {
    return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
  }

  requestData.count++;
  next();
};

// Clean up old entries from rateLimitMap to prevent memory leaks
setInterval(() => {
  const currentTime = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (currentTime - data.startTime > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // Fallback to * if FRONTEND_URL is not set
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password for Gmail
  },
});

// Contact Route
app.post("/api/contact", customRateLimiter, (req, res) => {
  const { user_name, user_email, message } = req.body;

  // Basic Input Validation
  if (!user_name || !user_email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user_email)) {
    return res.status(400).json({ success: false, message: "Invalid email format." });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER, // Must be your authenticated email
    to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
    replyTo: user_email, // This allows you to click 'Reply' in your email to respond to the visitor
    subject: `🚀 Portfolio Message: ${user_name}`,
    text:
      `You have a new message from your portfolio:\n\n` +
      `Name: ${user_name}\n` +
      `Email: ${user_email}\n\n` +
      `Message:\n${message}`,
  };

  // Respond immediately to the client to make the UI feel fast
  res.status(200).json({ success: true, message: "Message Sent Successfully!" });

  // Process the email sending asynchronously in the background
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending mail:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
