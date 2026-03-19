const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, "secretkey");
    req.user = verified;
    next();
  } catch (err) {
    return res.json({ message: "Invalid token" });
  }
};

app.get("/", (req, res) => {
  res.send("Smart Sports Facility Booking System Backend is running");
});

app.get("/facilities", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM facilities");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/bookings/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM bookings WHERE user_id = $1",
      [id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err.message);
  }
});

app.put("/bookings/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    // Check if booking belongs to user
    const booking = await pool.query(
      "SELECT * FROM bookings WHERE booking_id = $1",
      [id]
    );

    if (booking.rows.length === 0) {
      return res.json({ message: "Booking not found" });
    }

    if (booking.rows[0].user_id !== user_id) {
      return res.json({ message: "You can only cancel your own bookings" });
    }

    // Cancel booking
    const result = await pool.query(
      "UPDATE bookings SET booking_status = 'cancelled' WHERE booking_id = $1 RETURNING *",
      [id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err.message);
  }
});

app.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [full_name, email, hashedPassword, phone]
    );

    res.json(newUser.rows[0]);

  } catch (err) {
    console.error(err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.json({ message: "User not found" });
    }

    // Compare password
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.json({ message: "Invalid password" });
    }

    // Create token
    const token = jwt.sign(
      { user_id: user.rows[0].user_id },
      "secretkey"
    );

    res.json({
      message: "Login successful",
      token: token
    });

  } catch (err) {
    console.error(err.message);
  }
});


app.post("/bookings", authenticateToken, async (req, res) => {
  try {

    const user_id = req.user.user_id;
    const { facility_id, booking_date, start_time, end_time } = req.body;

    // Check if slot is already booked
    const checkBooking = await pool.query(
      `SELECT * FROM bookings 
       WHERE facility_id = $1 
       AND booking_date = $2
       AND booking_status != 'cancelled'
       AND (
            (start_time <= $3 AND end_time > $3) OR
            (start_time < $4 AND end_time >= $4) OR
            ($3 <= start_time AND $4 >= end_time)
       )`,
      [facility_id, booking_date, start_time, end_time]
    );

    if (checkBooking.rows.length > 0) {
      return res.json({
        message: "This time slot is already booked for this facility"
      });
    }

    const newBooking = await pool.query(
      `INSERT INTO bookings 
      (user_id, facility_id, booking_date, start_time, end_time)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [user_id, facility_id, booking_date, start_time, end_time]
    );

    res.json(newBooking.rows[0]);

  } catch (err) {
    console.error(err.message);
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});