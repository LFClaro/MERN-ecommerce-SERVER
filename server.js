const express = require('express');
const connectDB = require('./config/connectDB');
const cors = require('cors');
const dotenv = require('dotenv').config();
const userRouter = require('./routes/userRoutes'); //responsible to user register
const authRouter = require('./routes/authRoutes'); //responsible authorize user
const faqRouter = require('./routes/faqRoutes'); //responsible for faq

connectDB(); //Datebase Connected log should show in console

const app = express();//create application to set up entire server
app.use(cors());
app.use(express.json())//****important for post */ allow u pass json information from the body by a formed post

app.use('/user/register', userRouter);
app.use('/auth', authRouter);
app.use('/faqs', faqRouter);

const PORT = process.env.PORT | 5000;
app.listen(PORT, 'localhost', () => {
    console.log(`The server is running on Port ${PORT}`);
})