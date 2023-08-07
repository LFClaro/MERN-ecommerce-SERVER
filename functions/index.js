const functions = require("firebase-functions");
const express = require("express");
const connectDB = require("./config/connectDB");
const cors = require("cors")({origin: true});
const fileUpload = require("express-fileupload");
// const dotenv = require("dotenv").config();

const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const faqRouter = require("./routes/faqRoutes");
const checkoutRoute = require("./routes/checkoutRoutes");
const contactRoute = require("./routes/contactRoutes");
const communityReplyRoute = require("./routes/communityReplyRoute");
const communityPostRoute = require("./routes/communityPostRoute");
const profileRoute = require("./routes/profileRoute");
const itemRoute = require("./routes/itemRoutes");
const messageRoute = require("./routes/messageRoute");
const rentalRoute = require("./routes/rentalRoutes");
const adminRoute = require("./routes/adminRoutes");

connectDB(); // Datebase Connected log should show in console

const app = express();// create application to set up entire server
app.use(cors);
app.use(fileUpload()); // Set up fileUpload
app.use(express.json());//* ***important for post
// allow u pass json information from the body by a formed post

app.get("/", (req, res) => {
  try {
    res.send("Hello, World!\nThis is the MERN-ecommerce API server.");
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({error: "SERVER ERROR: " + err.message});
  }
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/faqs", faqRouter);
app.use("/api/checkout", checkoutRoute);
app.use("/api/contact", contactRoute);
app.use("/api/communityReply", communityReplyRoute);
app.use("/api/communityPost", communityPostRoute);
app.use("/api/profile", profileRoute);
app.use("/api/items", itemRoute);
app.use("/api/messages", messageRoute);
app.use("/api/rentals", rentalRoute);
app.use("api/admin", adminRoute);

const PORT = process.env.MERNMANIACS_PORT || 5555;
app.listen(PORT, () => {
  console.log(`The server is running on Port ${PORT}`);
});

exports.app = functions.https.onRequest(app);
