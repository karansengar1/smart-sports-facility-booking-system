import { useState } from "react";
import axios from "axios";

function Register({ setIsRegistering }) {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = async () => {
    if (!full_name || !email || !password || !phone) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post("http://localhost:5000/register", {
        full_name,
        email,
        password,
        phone,
      });

      alert("Registration successful!");
      setIsRegistering(false); // go back to login
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <div className="card">
      <h1>Register</h1>

      <input
        type="text"
        placeholder="Full Name"
        value={full_name}
        onChange={(e) => setFullName(e.target.value)}
      />
      <br /><br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <br /><br />

      <button onClick={handleRegister}>Register</button>

      <br /><br />

      <button onClick={() => setIsRegistering(false)}>
        Back to Login
      </button>
    </div>
  );
}

export default Register;