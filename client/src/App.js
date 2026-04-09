import { useState, useEffect, useCallback } from "react";
import axios from "axios";

import Login from "./components/Login";
import Register from "./components/Register";
import Facilities from "./components/Facilities";
import Bookings from "./components/Bookings";
import ManagerDashboard from "./components/ManagerDashboard";
import "./App.css";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch (err) {
    console.error("Invalid token");
    return null;
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const fetchFacilities = useCallback(async () => {
    const res = await axios.get("http://localhost:5000/facilities");
    setFacilities(res.data);
  }, []);

  const fetchBookings = useCallback(async () => {
    const user_id = getUserIdFromToken();
    if (!user_id) return;

    const res = await axios.get(
      `http://localhost:5000/bookings/user/${user_id}`
    );
    setBookings(res.data);
  }, []);

  useEffect(() => {
    if (token) setIsLoggedIn(true);
  }, [token]);

  useEffect(() => {
    if (isLoggedIn && role === "customer") {
      fetchFacilities();
      fetchBookings();
    }
  }, [isLoggedIn, role, fetchFacilities, fetchBookings]);

  const handleBooking = async (facility_id) => {
    if (!date || !startTime || !endTime) {
      showMessage("Please select date and time before booking", "error");
      return;
    }

    if (startTime >= endTime) {
      showMessage("End time must be after start time", "error");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/bookings",
        {
          facility_id,
          booking_date: date,
          start_time: startTime,
          end_time: endTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage(res.data.message || "Booking successful", "success");
      fetchBookings();
    } catch (err) {
      console.error(err);
      showMessage("Booking failed", "error");
    }
  };

  const handleCancel = async (booking_id) => {
    try {
      await axios.put(
        `http://localhost:5000/bookings/${booking_id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showMessage("Booking cancelled successfully", "success");
      fetchBookings();
    } catch (err) {
      console.error(err);
      showMessage("Cancel failed", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setIsRegistering(false);
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="container">
      {!isLoggedIn ? (
        isRegistering ? (
          <Register setIsRegistering={setIsRegistering} />
        ) : (
          <Login
            setIsLoggedIn={setIsLoggedIn}
            setIsRegistering={setIsRegistering}
          />
        )
      ) : (
        <>
          <div
            style={{
              width: "100%",
              backgroundColor: "#1e293b",
              color: "white",
              padding: "15px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>Smart Booking System</h2>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#dc3545",
              }}
            >
              Logout
            </button>
          </div>

          {message && (
            <div className={messageType === "success" ? "success-message" : "error-message"}>
              {message}
            </div>
          )}

          {role === "manager" ? (
            <ManagerDashboard />
          ) : (
            <>
              <Facilities
                facilities={facilities}
                handleBooking={handleBooking}
                date={date}
                setDate={setDate}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
              />

              <Bookings bookings={bookings} handleCancel={handleCancel} />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;