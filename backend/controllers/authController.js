const User = require('../models/user');
const { hashPassword, comparePassword } = require('../helpers/auth.js');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const formatUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    gift: user.gift,
    onboarded: user.onboarded,
    profile: user.profile
});

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const test = (req, res) => res.json('MikeAI Neural Link: Active');

const registerUser = async (req, res) => {
    try {
        const { name, email, password, giftCode } = req.body;
        if (!name) return res.json({ error: 'Name is required' });
        if (!password || password.length < 6) return res.json({ error: 'Password too short' });
        
        const exist = await User.findOne({ email });
        if (exist) return res.json({ error: 'Email already registered' });

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            gift: giftCode === 'MIKE' ? 'Full Access Granted' : '',
        });

        res.json(formatUserResponse(user));
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.json({ error: 'User not found' });

        const match = await comparePassword(password, user.password);
        if (!match) return res.json({ error: 'Wrong password' });

        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token, cookieOptions).json(formatUserResponse(user));
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { idToken, giftCode } = req.body;
        
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture } = decodedToken;

        let user = await User.findOne({ email });

        if (!user) {
            let giftMessage = '';
            const cleanCode = giftCode ? giftCode.trim().toUpperCase() : null;

            if (cleanCode === 'MIKE') {
                giftMessage = 'Thanks for using the Gift Code! Access granted.';
            }

            user = await User.create({
                name,
                email,
                password: '',
                onboarded: false,
                gift: giftMessage, 
                profile: { photo: picture }
            });
        }

        const token = jwt.sign(
            { email: user.email, id: user._id, name: user.name }, 
            process.env.JWT_SECRET
        );
        res.cookie('token', token, cookieOptions).json(formatUserResponse(user));

    } catch (error) {
        console.error("GOOGLE_LOGIN_ERROR:", error);
        res.status(500).json({ error: 'Google Authentication failed' });
    }
};

const getProfile = (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.json(null);

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
        if (err) return res.json(null);

        const user = await User.findById(userData.id);
        res.json(user ? formatUserResponse(user) : null);
    });
};

const updateProfile = async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        try {
            const { name, profile } = req.body;
            
            // Find user and update
            const updatedUser = await User.findByIdAndUpdate(
                userData.id,
                { 
                    name: name,
                    profile: profile, // This includes photo and role from the frontend
                    onboarded: true 
                },
                { new: true } // Returns the newly updated document
            );
            
            res.json(formatUserResponse(updatedUser));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'System update failed' });
        }
    });
};

// --- REQUEST password RESET ---
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) return res.json({ error: 'No account found with this email' });

        // 1. Generate the token FIRST
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // 2. Create the link SECOND (Now it can use resetToken)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // 3. Create the template THIRD (Now it can use resetLink)
        const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #F2F2F7; }
                .card { background: #ffffff; border-radius: 40px; padding: 40px; border: 1px solid #e2e8f0; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
                .logo { width: 60px; height: 60px; margin-bottom: 20px; }
                .title { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 10px; letter-spacing: -1px; }
                .highlight { color: #dc2626; }
                .text { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 30px; font-weight: 600; }
                .button { 
                    display: inline-block; 
                    padding: 18px 36px; 
                    background: linear-gradient(to right, #b91c1c, #ea580c); 
                    color: #ffffff !important; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: 900; 
                    font-size: 11px; 
                    text-transform: uppercase; 
                    letter-spacing: 2px;
                    box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3);
                }
                .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <img src="#" alt="MikeAI" class="logo">
                    <h1 class="title">Reset <span class="highlight">Access</span></h1>
                    <p class="text">
                        We received a request to reset the password for your MikeAI account.<br>
                        Click the button below to initialize your new credentials.
                    </p>
                    <a href="${resetLink}" class="button">Initialize New Password</a>
                    <p class="text" style="margin-top: 30px; font-size: 12px;">
                        If you didn't request this, you can safely ignore this email.<br>
                        This link expires in 15 minutes.
                    </p>
                    <div class="footer">
                        &copy; 2026 MikeAI Protocol. All Rights Reserved.
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"MikeAI Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reset Your MikeAI Password',
            html: emailTemplate 
        });

        res.json({ message: 'Success! Check your Gmail for the reset link.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send reset email' });
    }
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await hashPassword(password);
        await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        res.json({ message: 'Password updated successfully. You can now login.' });
    } catch (error) {
        res.status(400).json({ error: 'Link expired or invalid.' });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie('token', { path: '/', httpOnly: true, sameSite: 'lax' })
       .json({ message: 'Logged out' });
};

const deleteAccount = async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
        if (err) return res.status(403).json({ error: "Session expired" });
        try {
            await User.findByIdAndDelete(userData.id);
            res.clearCookie('token', { path: '/', httpOnly: true, sameSite: 'lax' })
               .json({ message: 'Account deleted' });
        } catch (error) {
            res.status(500).json({ error: 'System failure during deletion' });
        }
    });
};

// Make sure forgotPassword and resetPassword are in the exports!
module.exports = { 
    test, 
    registerUser, 
    loginUser, 
    googleLogin, 
    getProfile, 
    updateProfile, 
    logoutUser, 
    forgotPassword, 
    resetPassword,
    deleteAccount
};