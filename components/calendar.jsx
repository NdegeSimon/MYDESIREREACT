import React from "react";

function Calendar({ selectedDate, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-primary">Pick a Date</h2>
      <input
        type="date"
        className="p-3 rounded-md bg-gray-800 text-white border border-gray-600"
        value={selectedDate || ""}
        onChange={e => onSelect(e.target.value)}
      />
    </div>
  );
}

export default Calendar;
