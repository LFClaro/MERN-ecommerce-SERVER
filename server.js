const express = require('express');
const connectDB = require('./config/connectDB');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv').config();

// const userRouter = require('./routes/userRoutes'); //responsible to user register
// const authRouter = require('./routes/authRoutes'); //responsible authorize user
// const faqRouter = require('./routes/faqRoutes'); //responsible for faq
// const checkoutRoute = require('./routes/checkoutRoutes'); // get access to our checkout route
// const contactRoute = require('./routes/contactRoutes'); // get access to our contact route
// const communityReplyRoute = require('./routes/communityReplyRoute');// get access to our community route
// const communityPostRoute = require('./routes/communityPostRoute');// get access to our community route
// const profileRoute = require('./routes/profileRoute');// get access to our profile route
// const itemRoute = require('./routes/itemRoutes'); // access item route
// const messageRoute = require('./routes/messageRoute'); // access message route
// const rentalRoute = require('./routes/rentalRoutes'); // access rental route
// const adminRoute = require('./routes/adminRoutes'); //access to admin panel

connectDB(); //Datebase Connected log should show in console

const app = express();//create application to set up entire server
app.use(cors());
app.use(fileUpload()); // Set up fileUpload
app.use(express.json());//****important for post */ allow u pass json information from the body by a formed post

app.get("/", (req, res) => {
    try {
        res.send("Hello, World!");
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: "SERVER ERROR: " + err.message });
    }
});

// app.use('/api/users', userRouter);
// app.use('/api/auth', authRouter);
// app.use('/api/faqs', faqRouter);
// app.use('/api/checkout', checkoutRoute);
// app.use('/api/contact', contactRoute);
// app.use('/api/communityReply', communityReplyRoute);
// app.use('/api/communityPost', communityPostRoute);
// app.use('/api/profile', profileRoute);
// app.use('/api/items', itemRoute);
// app.use('/api/messages', messageRoute);
// app.use('/api/rentals', rentalRoute);
// app.use('api/admin', adminRoute);

const PORT = process.env.PORT | 5000;
app.listen(PORT, 'localhost', () => {
    console.log(`The server is running on Port ${PORT}`);
})