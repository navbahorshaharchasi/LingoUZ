const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware sozlamalari
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// public papkasini ulash (frontend uchun)
app.use(express.static(path.join(__dirname, 'public')));

// Vaqtinchalik ma'lumotlar bazasi (Xotirada saqlash uchun massivlar)
let users = [];
let verificationCodes = {};

// 1. Ro'yxatdan o'tish (Register)
app.post('/api/register', (req, res) => {
    const { fullName, birthDate, phone, passport, password } = req.body;

    // Telefon yoki pasport band qilinganligini tekshirish
    const exists = users.find(u => u.passport === passport || u.phone === phone);
    if (exists) {
        return res.status(400).json({ success: false, message: 'Bu telefon raqam yoki pasport allaqachon ro‘yxatdan o‘tgan!' });
    }

    // Yangi foydalanuvchini qo'shish
    const newUser = { fullName, birthDate, phone, passport, password, createdAt: new Date() };
    users.push(newUser);

    res.json({ success: false, message: 'Muvaffaqiyatli ro‘yxatdan o‘tdingiz!' });
});

// 2. Kirish (Login)
app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body; // identifier - telefon yoki pasport bo'lishi mumkin

    const user = users.find(u => (u.phone === identifier || u.passport === identifier) && u.password === password);
    if (!user) {
        return res.status(400).json({ success: false, message: 'Login yoki parol xato!' });
    }

    res.json({ success: true, message: 'Xush kelibsiz!', user: { fullName: user.fullName, phone: user.phone } });
});

// Portni sozlash (Render avtomatik beradigan port yoki 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda ishga tushdi!`);
});
