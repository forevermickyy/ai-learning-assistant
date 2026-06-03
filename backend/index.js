const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require('openai');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const multer = require('multer');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Core AI Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configured base URL so the OpenAI SDK routes traffic cleanly to Groq
const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1" 
});

// Database connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Neural Database Connected'))
  .catch((err) => console.error('DB Connection Error:', err.message));

// --- FIXED & ROBUST CORS ENFORCEMENT MATRIX ---
const allowedOrigins = [
    'https://ai-learning-assistant-three-nu.vercel.app', // Hardcoded fallback insurance
    'http://localhost:5173',                             // Vite Local development
    'http://localhost:3000'                              // Alternative local dev
];

// Cleanly capture process.env variable if it exists safely
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.trim().replace(/\/$/, ""));
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl health checks, or postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.warn(`⚠️ CORS Blocked Origin: ${origin}`);
            return callback(new Error('Not allowed by CORS policy'));
        }
    },
    credentials: true, // Crucial for passing authorization cookies across origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// ✅ FIXED syntax for Express 5 wildcard parameter matching
app.options('(.*)', (req, res) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.sendStatus(200);
});
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

/**
 * CORE CHAT ENDPOINT
 * Handles File Processing, Model Routing, and Stream Management
 */
app.post("/api/chat", upload.single('file'), async (req, res) => {
  const { prompt, profile, modelType = 'gemini' } = req.body;
  const parsedProfile = typeof profile === 'string' ? JSON.parse(profile) : profile;

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 1. FILE PRE-PROCESSING
  let userParts = [];
  try {
    if (req.file) {
      const mimeType = req.file.mimetype;
      if (mimeType.startsWith('image/')) {
        userParts.push({ inlineData: { data: req.file.buffer.toString('base64'), mimeType } });
      } else {
        let fileText = "";
        if (mimeType === 'application/pdf') {
          const data = await pdf(req.file.buffer);
          fileText = data.text;
        } else if (mimeType.includes('wordprocessingml')) {
          const data = await mammoth.extractRawText({ buffer: req.file.buffer });
          fileText = data.value;
        }
        userParts.push({ text: `[ATTACHED FILE CONTENT]:\n${fileText}` });
      }
    }
  } catch (err) {
    console.error("Neural Extraction Error:", err);
  }

  // 2. REUSABLE GEMINI STREAMER (With Internal Failover)
  const runGeminiSync = async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const systemInstr = `You are MikeAI. Role: ${parsedProfile?.role || 'User'}.`;
    
    const result = await model.generateContentStream({
      contents: [{ 
        role: 'user', 
        parts: [{ text: systemInstr }, ...userParts, { text: prompt }] 
      }]
    });

    for await (const chunk of result.stream) {
      try {
        const text = chunk.text();
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      } catch (e) {
         // Gracefully skip empty structural meta chunks
      }
    }
  };

  // 3. MAIN EXECUTION FLOW
  try {
    if (modelType === 'groq') {
      console.log(">>> ROUTING: Groq Llama3 70b");
      const stream = await groq.chat.completions.create({
        model: "llama3-70b-8192", 
        messages: [
          { role: "system", content: `You are MikeAI. Role: ${parsedProfile?.role || 'User'}` },
          { role: "user", content: prompt + (userParts[0]?.text || "") }
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    } else {
      // Primary Gemini Logic with Failover
      try {
        console.log(">>> ROUTING: Gemini 2.5 Flash");
        await runGeminiSync("gemini-2.5-flash");
      } catch (geminiErr) {
        const isQuotaError = geminiErr.status === 429 || geminiErr.message?.includes('quota');
        if (isQuotaError) {
          console.warn(">>> FAILOVER: Saturated. Routing to Flash-Lite...");
          await runGeminiSync("gemini-1.5-flash-8b");
        } else {
          throw geminiErr; // Rethrow non-quota errors
        }
      }
    }
  } catch (err) {
    console.error("Neural Link Failure:", err);
    res.write(`data: ${JSON.stringify({ text: "\n\n[SYSTEM ERROR]: Neural Link unstable. Check connection." })}\n\n`);
  } finally {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Default Routes
app.get('/', (req, res) => res.json({ status: "Neural Core Online", version: "1.0.2" }));
app.use('/', require('./routes/authRoutes'));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`MikeAI Core active on port ${port}`));