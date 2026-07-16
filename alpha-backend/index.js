const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 
const app = express();

app.use(express.json());
const SECRET_KEY = "ALPHA_SUPER_SECRET_KEY_2026";

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error(err.message);
  else console.log('تم الاتصال بقاعدة البيانات بنجاح!');
});

// الجداول الأساسية لمشروع ألفا [cite: 77, 87, 88]
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE, email TEXT UNIQUE, phone TEXT UNIQUE, password TEXT,
    phoneOtp TEXT, isPhoneVerified INTEGER DEFAULT 0, emailToken TEXT, isEmailVerified INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER, amount REAL, category TEXT, type TEXT, date TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
)`);

// --- روابط التوثيق والحسابات ---
app.post('/api/user/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailToken = crypto.randomBytes(20).toString('hex');
    const sql = 'INSERT INTO users (username, email, phone, password, phoneOtp, emailToken) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [username, email, phone, hashedPassword, phoneOtp, emailToken], function(err) {
      if (err) return res.status(400).json({ error: "البيانات مستخدمة مسبقاً." });
      res.json({ message: "تم إنشاء الحساب!", mockSms: `OTP: ${phoneOtp}`, mockEmailLink: `http://localhost:3000/api/user/verify-email/${emailToken}` });
    });
  } catch (error) { res.status(500).json({ error: "خطأ" }); }
});

app.post('/api/user/verify-phone', (req, res) => {
  const { phone, otp } = req.body;
  db.run('UPDATE users SET isPhoneVerified = 1, phoneOtp = NULL WHERE phone = ? AND phoneOtp = ?', [phone, otp], function(err) {
    if (this.changes === 0) return res.status(400).json({ error: "الرمز غير صحيح." });
    res.json({ message: "تم توثيق الهاتف!" });
  });
});

app.get('/api/user/verify-email/:token', (req, res) => {
  db.run('UPDATE users SET isEmailVerified = 1, emailToken = NULL WHERE emailToken = ?', [req.params.token], function(err) {
    if (this.changes === 0) return res.status(400).send("رابط غير صالح.");
    res.send("<h1 style='color:green;'>تم توثيق الإيميل!</h1>");
  });
});

app.post('/api/user/login', (req, res) => {
  const { phone, password } = req.body; 
  db.get('SELECT * FROM users WHERE phone = ?', [phone], async (err, user) => {
    if (err || !user) return res.status(404).json({ error: "غير مسجل." });
    if (user.isPhoneVerified === 0 || user.isEmailVerified === 0) return res.status(403).json({ error: "يرجى التوثيق أولاً." });
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ message: "تم الدخول!", token: token });
    } else { res.status(401).json({ error: "خطأ في الباسورد." }); }
  });
});

app.post('/api/finance/add', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "يرجى تسجيل الدخول." });
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "انتهت الجلسة." });
    const { amount, category, type } = req.body;
    db.run('INSERT INTO transactions (userId, amount, category, type, date) VALUES (?, ?, ?, ?, ?)', 
    [decoded.userId, amount, category, type, new Date().toISOString()], function(err) {
      res.json({ message: "تم تسجيل المعاملة!", id: this.lastID });
    });
  });
});

app.get('/api/finance/dashboard', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "غير مصرح." });
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token غير صالح." });
    const userId = decoded.userId;
    const sql = `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome, SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpenses FROM transactions WHERE userId = ?`;
    db.get(sql, [userId], (err, row) => {
      if (err) return res.status(500).json({ error: "خطأ في القاعدة." });
      const balance = (row.totalIncome || 0) - (row.totalExpenses || 0);
      res.json({ username: decoded.username, summary: { income: row.totalIncome || 0, expenses: row.totalExpenses || 0, currentBalance: balance } });
    });
  });
});

// --- الرابط المطور نهائياً: المحاكاة الذكية المربوطة ببيانات المستخدم الحقيقية --- [cite: 77, 84, 114, 117]
app.get('/api/finance/ai-analysis', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "غير مصرح." });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "انتهت الجلسة." });

    const userId = decoded.userId;

    // قراءة مصاريف المستخدم الحقيقية لحساب التنبؤ الذكي [cite: 77, 110, 113]
    const sql = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpenses,
        SUM(CASE WHEN type = 'expense' AND category = 'ترفيه' THEN amount ELSE 0 END) as impulsiveExpenses
      FROM transactions 
      WHERE userId = ?
    `;

    db.get(sql, [userId], (err, row) => {
      if (err) return res.status(500).json({ error: "خطأ." });

      const income = row.totalIncome || 1; // تجنب القسمة على صفر
      const expenses = row.totalExpenses || 0;
      const impulsive = row.impulsiveExpenses || 0;

      // حساب النسبة المئوية للصرف الاندفاعي من إجمالي الدخل [cite: 77, 85, 114]
      const impulsivePercent = (impulsive / income) * 100;
      
      // محاكاة النضج المالي وتوقع الادخار السنوي [cite: 77, 86, 114, 117]
      const expectedYearlySavings = (income - expenses) * 12;
      let maturityScore = 100 - impulsivePercent;
      if (maturityScore < 0) maturityScore = 0;

      // توليد نصيحة الذكاء الاصطناعي بناءً على البيانات المخزنة [cite: 77, 106, 108]
      let aiNudge = "";
      if (impulsivePercent > 30) {
        aiNudge = "🚨 تنبيه استباقي من نظام ألفا: نمط صرفك على الترفيه مرتفع ويشكل " + impulsivePercent.toFixed(1) + "% من دخلك. هذا يهدد أهدافك المالية القادمة!";
      } else {
        aiNudge = "🌟 نظام ألفا يحييك! نمط صرفك الاندفاعي ممتاز وتحت السيطرة. أنت تبني مستقبلك المالي بذكاء.";
      }

      res.json({
        username: decoded.username,
        aiAnalysis: {
          financialMaturityScore: maturityScore.toFixed(1) + "%",
          projectedYearlySavings: (expectedYearlySavings > 0 ? expectedYearlySavings : 0).toFixed(2) + " JOD",
          proactiveNudge: aiNudge
        }
      });
    });
  });
});

app.listen(3000, () => console.log('Server is running on port 3000'));