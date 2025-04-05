const bcrypt = require("bcrypt");

const password = "1234"; // Change this to the password you want
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("Hashed password:", hashedPassword);
});