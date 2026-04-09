function Facilities({ facilities, handleBooking, date, setDate, startTime, setStartTime, endTime, setEndTime }) {
  return (
    <div>
      <h1>Facilities</h1>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <br /><br />

      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <br /><br />

      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

      <div>
        {facilities.map((f) => (
          <div key={f.facility_id} className="card">
            <h3>{f.facility_name}</h3>
            <p>{f.sport_type}</p>
            <p>{f.location}</p>

            <button onClick={() => handleBooking(f.facility_id)}>
              Book
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Facilities;