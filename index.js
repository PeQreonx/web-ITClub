const express = require("express");
const { rateLimit } = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  limit: 1000,
  legacyHeaders: false,
  standardHeaders: "draft-7"
});

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/api", limiter);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'eqlatihanyok1@gmail.com',
    pass: 'odrufvgmihakkfco'
  }
});

app.get("/", function(req, res) {
  const submitCookie = req.cookies.submitted;
  if (submitCookie) {
    const submitTime = new Date(submitCookie);
    const now = new Date();
    const daysDiff = (now - submitTime) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 15) {
      return res.sendFile(path.join(__dirname, "public", "success.html"));
    }
  }
  
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/success", function(req, res) {
  res.sendFile(path.join(__dirname, "public", "success.html"));
});

app.post("/api/submit", async (req, res) => {
  try {
    const { nama, email, whatsapp, kelas, divisi } = req.body;
    
    if (!nama || !email || !whatsapp || !kelas || !divisi) {
      return res.status(400).json({ 
        success: false, 
        message: "Semua field wajib diisi!" 
      });
    }

    const submitCookie = req.cookies.submitted;
    if (submitCookie) {
      const submitTime = new Date(submitCookie);
      const now = new Date();
      const daysDiff = (now - submitTime) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 15) {
        return res.status(429).json({ 
          success: false, 
          message: "Anda sudah mendaftar. Silakan coba lagi setelah 15 hari." 
        });
      }
    }
    
    // Setup email
    const mailOptions = {
      from: {
        name: "IT Club",
        address: "eqlatihanyok1@gmail.com"
      },
      to: email,
      subject: 'Pendaftaran Baru - IT Club Ekstrakurikuler',
      html: `
        <h2>Pendaftaran Baru IT Club</h2>
        <p><strong>Nama:</strong> ${nama}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Nomor WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Kelas:</strong> ${kelas}</p>
        <p><strong>Divisi:</strong> ${divisi}</p>
        <p><strong>Waktu Pendaftaran:</strong> ${new Date().toLocaleString('id-ID')}</p>
      `
    };
 
    await transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        res.status(500).json({ 
          success: false, 
          message: "Terjadi kesalahan server. Silakan coba lagi." 
        });
        return;
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    
    const expires = new Date();
    expires.setDate(expires.getDate() + 15);
    res.cookie('submitted', new Date().toISOString(), { 
      expires: expires,
      httpOnly: true 
    });
    
    res.json({ 
      success: true, 
      message: "Pendaftaran berhasil! Data Anda telah dikirim." 
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Terjadi kesalahan server. Silakan coba lagi." 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
});