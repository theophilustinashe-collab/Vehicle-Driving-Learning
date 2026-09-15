import jwt from 'jsonwebtoken';
const SECRET = "a_very_long_and_random_secret_key_12345";
const payload = { userId: 1, role: "admin" };
const token = jwt.sign(payload, SECRET, { expiresIn: "2h" });
console.log(token);
