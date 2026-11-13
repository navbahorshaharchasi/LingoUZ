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

// Vaqtinchalik ma'lumotlar bazasi (Foydalanuvchilar va ularning natijalari)
let users = [];

// 1. Ro'yxatdan o'tish (Register)
app.post('/api/register', (req, res) => {
    const { fullName, birthDate, phone, passport, password } = req.body;

    // Telefon yoki pasport band qilinganligini tekshirish
    const exists = users.find(u => u.passport === passport || u.phone === phone);
    if (exists) {
        return res.status(400).json({ success: false, message: 'Bu telefon raqam yoki pasport allaqachon ro‘yxatdan o‘tgan!' });
    }

    // Yangi foydalanuvchini qo'shish (boshlang'ich natija 0 yoki bo'sh holatda)
    const newUser = { 
        fullName, 
        birthDate, 
        phone, 
        passport, 
        password, 
        score: 0, // Natija uchun maydon
        createdAt: new Date() 
    };
    users.push(newUser);

    res.json({ success: true, message: 'Muvaffaqiyatli ro‘yxatdan o‘tdingiz!' });
});

// 2. Kirish (Login)
app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body; 

    const user = users.find(u => (u.phone === identifier || u.passport === identifier) && u.password === password);
    if (!user) {
        return res.status(400).json({ success: false, message: 'Login yoki parol xato!' });
    }

    res.json({ success: true, message: 'Xush kelibsiz!', user: { fullName: user.fullName, phone: user.phone, score: user.score } });
});

// 3. Barcha ro'yxatdan o'tgan talabalar ro'yxati va natijalarini olish (Admin yoki tekshiruv uchun)
app.get('/api/users', (req, res) => {
    // Maxfiylik uchun parollarni yashirib, qolgan ma'lumotlarni qaytaramiz
    const safeUsers = users.map(u => ({
        fullName: u.fullName,
        phone: u.phone,
        passport: u.passport,
        score: u.score,
        createdAt: u.createdAt
    }));
    res.json({ success: true, users: safeUsers });
});

// Portni sozlash
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda ishga tushdi!`);
});
