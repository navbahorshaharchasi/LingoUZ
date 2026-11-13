const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Vaqtinchalik baza (Real loyihada MongoDB yoki PostgreSQL ulanadi)
let users = []; 
let verificationCodes = {};

// Ro'yxatdan o'tish
app.post('/api/register', (req, res) => {
    const { fullName, birthDate, phone, passport, password } = req.body;
    
    // Pasport yoki telefon band qilinganligini tekshirish
    const exists = users.find(u => u.passport === passport || u.phone === phone);
    if (exists) {
        return res.status(400).json({ success: false, message: "Bu pasport yoki telefon raqam allaqachon ro'yxatdan o'tgan!" });
    }

    const newUser = {
        id: Date.now().toString(),
        fullName,
        birthDate,
        phone,
        passport,
        password,
        currentDay: 1,
        completedTests: [],
        mistakes: [],
        createdAt: new Date()
    };

    users.push(newUser);
    res.json({ success: true, user: newUser });
});

// Kirish (Login)
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    const user = users.find(u => u.phone === phone && u.password === password);
    if (!user) {
        return res.status(400).json({ success: false, message: "Telefon raqam yoki parol xato!" });
    }
    res.json({ success: true, user });
});

// Parolni tiklash: Kod yuborish (+998505536776 raqamidan simulyatsiya)
app.post('/api/forgot-password', (req, res) => {
    const { phone } = req.body;
    const user = users.find(u => u.phone === phone);
    if (!user) {
        return res.status(400).json({ success: false, message: "Bu raqam ro'yxatdan o'tmagan!" });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    verificationCodes[phone] = code;

    // Real loyihada bu yerda Telegram Bot yoki SMS API orqali +998505536776 raqamidan kod yuboriladi
    console.log(`[SMS +998505536776]: ${phone} raqamiga tasdiqlash kodi yuborildi: ${code}`);
    
    res.json({ success: true, message: "Tasdiqlash kodi yuborildi", debugCode: code }); // Sinov uchun code qaytariladi
});

// Kodni tekshirish va parolni o'zgartirish
app.post('/api/reset-password', (req, res) => {
    const { phone, code, newPassword } = req.body;
    if (verificationCodes[phone] !== code) {
        return res.status(400).json({ success: false, message: "Tasdiqlash kodi noto'g'ri!" });
    }

    const user = users.find(u => u.phone === phone);
    if (user) {
        user.password = newPassword;
        delete verificationCodes[phone];
        return res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi!" });
    }
    res.status(400).json({ success: false, message: "Foydalanuvchi topilmadi." });
});

// Admin ma'lumotlarini olish
app.get('/api/admin/users', (req, res) => {
    res.json({ success: true, users });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`LingoUZ server ishga tushdi: http://localhost:${PORT}`);
});