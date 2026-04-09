function Bookings({ bookings, handleCancel }) {
  return (
    <div>
      <h2>My Bookings</h2>

      {bookings.map((b) => (    
        <div key={b.booking_id} className="card">
          <p>Facility ID: {b.facility_id}</p>
          <p>Date: {b.booking_date}</p>
          <p>Time: {b.start_time} - {b.end_time}</p>
          <p>Status: {b.booking_status}</p>

          {b.booking_status !== "cancelled" && (
            <button onClick={() => handleCancel(b.booking_id)}>
              Cancel Booking
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Bookings;