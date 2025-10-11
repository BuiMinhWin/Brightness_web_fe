import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";

interface Event {
  id: number;
  title: string;
  time: string;
  date: string; // ISO date format
}

const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events] = useState<Event[]>([
    {
      id: 1,
      title: "Go to gym",
      time: "6pm – 8pm",
      date: new Date().toISOString().split("T")[0],
    },
  ]);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert Sunday (0) to 7 for Monday-first week
    return day === 0 ? 6 : day - 1;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventCountForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateStr).length;
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateStr);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const rows: JSX.Element[][] = [];
    let days: JSX.Element[] = [];

    // Previous month's last days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
      const eventCount = getEventCountForDate(date);

      days.push(
        <div
          key={`prev-${day}`}
          className="h-11 flex items-center justify-center font-bold cursor-pointer relative"
          style={{ opacity: 0.35, fontWeight: 800, color: "#0b3d33" }}
          onClick={() => setSelectedDate(date)}
        >
          <span className="flex items-center justify-center w-full h-full">{day}</span>
          {eventCount > 0 && (
            <div
              className="absolute w-8 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{
                background: "#c8ead6",
                border: "2px solid #1a6a56",
                bottom: "10px",
              }}
            >
              {eventCount}
            </div>
          )}
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday =
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        day === today.getDate();
      const isSelected =
        selectedDate &&
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getDate() === day;
      const dayOfWeek = date.getDay();
      const isSunday = dayOfWeek === 0;
      const eventCount = getEventCountForDate(date);

      days.push(
        <div
          key={day}
          className="h-11 flex items-center justify-center font-bold cursor-pointer relative transition-all hover:scale-110"
          onClick={() => setSelectedDate(date)}
        >
          {/* Current date background circle */}
          {isToday && !isSelected && (
            <div
              className="absolute w-8 h-8 rounded-full border-2 flex items-center justify-center"
              style={{
                background: "rgba(10, 106, 86, 0.1)",
                borderColor: "#0a6a56",
              }}
            />
          )}

          {/* Selected date background circle */}
          {isSelected && (
            <div
              className="absolute w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "#c8ead6",
                border: "2px solid transparent",
                backgroundImage:
                  "linear-gradient(#c8ead6, #c8ead6), linear-gradient(90deg, #d6ea44, #ff9c50)",
                backgroundOrigin: "border-box",
                backgroundClip: "content-box, border-box",
              }}
            />
          )}

          {/* Date number */}
          <span
            className="flex items-center justify-center w-full h-full relative z-10"
            style={{
              color: isSelected
                ? "#0a6a56"
                : isToday
                  ? "#0a6a56"
                  : isSunday
                    ? "#ff7b17"
                    : "#0b3d33",
              fontWeight: isSelected ? 900 : 700,
            }}
          >
            {day}
          </span>

          {/* Event count badge */}
          {eventCount > 0 && !isSelected && (
            <div
              className="absolute w-6 h-5 rounded-md flex items-center justify-center text-xs font-bold"
              style={{
                background: "#ff7b17",
                color: "white",
                top: "2px",
                right: "2px",
                minWidth: "20px",
              }}
            >
              {eventCount}
            </div>
          )}
        </div>
      );

      if (days.length === 7) {
        rows.push([...days]);
        days = [];
      }
    }

    // Next month's first days
    if (days.length > 0) {
      const remaining = 7 - days.length;
      for (let day = 1; day <= remaining; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
        const eventCount = getEventCountForDate(date);

        days.push(
          <div
            key={`next-${day}`}
            className="h-11 flex items-center justify-center font-bold cursor-pointer relative"
            style={{ opacity: 0.35, fontWeight: 800, color: "#0b3d33" }}
            onClick={() => setSelectedDate(date)}
          >
            <span className="flex items-center justify-center w-full h-full">{day}</span>
            {eventCount > 0 && (
              <div
                className="absolute w-6 h-5 rounded-md flex items-center justify-center text-xs font-bold"
                style={{
                  background: "#ff7b17",
                  color: "white",
                  top: "2px",
                  right: "2px",
                  minWidth: "20px",
                }}
              >
                {eventCount}
              </div>
            )}
          </div>
        );
      }
      rows.push([...days]);
    }

    return rows;
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const selectedDateStr = selectedDate
    ? `${selectedDate.toLocaleDateString("en-US", { month: "long" })} ${selectedDate.getDate()}`
    : "";

  const displayEvents = getEventsForSelectedDate();

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #bfe8d6 0%, #dff4e9 50%, #f1f8d6 100%)",
        color: "#022c3c",
        marginTop: "50px",
      }}
    >
      {/* Topbar */}
      <div
        className="px-6 py-3"
        style={{
          background: "linear-gradient(90deg, #0a6a56 0%, #69c68d 60%, #d6ea44 100%)",
        }}
      >
        <Navbar />
      </div>

      <div
        className="max-w-7xl mx-auto my-6 px-3 grid gap-5"
        style={{ gridTemplateColumns: "84px 1fr" }}
      >
        {/* Left rail */}
        <aside
          className="rounded-3xl p-0 flex flex-col items-center relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #8bd3b8 0%, #0a6a56 100%)",
            paddingTop: "18px",
          }}
        >
          <div style={{ height: 12 }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full my-2"
              style={{ background: "rgba(255, 255, 255, 0.35)" }}
            />
          ))}
          <div
            className="w-full rounded-b-3xl mt-auto"
            style={{
              height: "60px",
              background: "#0a6a56",
            }}
          />
        </aside>

        {/* Calendar content */}
        <main>
          {/* Heading row */}
          <div className="flex items-center justify-between px-3 py-1.5">
            <div className="font-black text-5xl" style={{ color: "#0b3d33" }}>
              Schedule
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateMonth("prev")}
                className="w-9 h-9 rounded-lg flex items-center justify-center border-2 hover:bg-opacity-10 hover:bg-white transition-all"
                style={{ borderColor: "#0a6a56", color: "#0a6a56" }}
              >
                ←
              </button>
              <div className="font-black tracking-wider" style={{ color: "#ff7b17" }}>
                {monthName}
              </div>
              <button
                onClick={() => navigateMonth("next")}
                className="w-9 h-9 rounded-lg flex items-center justify-center border-2 hover:bg-opacity-10 hover:bg-white transition-all"
                style={{ borderColor: "#0a6a56", color: "#0a6a56" }}
              >
                →
              </button>
            </div>
            <div className="flex items-center gap-2.5" style={{ color: "#0a6a56" }}>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center border-2"
                style={{ borderColor: "#0a6a56" }}
              >
                🔍
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center border-2"
                style={{ borderColor: "#0a6a56" }}
              >
                {getEventsForSelectedDate().length}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <section className="mt-2">
            {/* Weekdays */}
            <div
              className="grid grid-cols-7 gap-6 px-3 pt-5 pb-1.5 font-extrabold"
              style={{ color: "#0a6a56" }}
            >
              {weekdays.map((d, i) => (
                <div
                  key={d}
                  className="flex items-center justify-center"
                  style={{ color: i === 6 ? "#ff7b17" : "#0a6a56" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {renderCalendar().map((row, ri) => (
              <div key={ri} className="grid grid-cols-7 gap-6 px-3 pb-5">
                {row}
              </div>
            ))}
          </section>

          {/* Separator */}
          <div
            className="h-0.5 mx-3 my-1.5 rounded-sm"
            style={{
              background: "#0a6a56",
              opacity: 0.6,
              height: "3px",
              marginTop: "6px",
              marginBottom: "18px",
            }}
          />

          {/* Event tiles */}
          {displayEvents.length > 0 ? (
            displayEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl px-5 py-4 flex items-center gap-3 max-w-4xl ml-3 mb-4"
                style={{
                  background: "linear-gradient(90deg, #dce642 0%, #ffaf72 100%)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  color: "#022c3c",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border-2"
                  style={{ borderColor: "#ff7b17", color: "#ff7b17" }}
                >
                  📅
                </div>
                <div>
                  <div className="font-extrabold" style={{ color: "#0a6a56" }}>
                    {event.title}
                  </div>
                  <div className="text-xs" style={{ color: "#0b3d33", opacity: 0.9 }}>
                    {event.time}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-opacity-60" style={{ color: "#0a6a56" }}>
              No events scheduled for this day
            </div>
          )}

          {/* Add action */}
          <div className="flex justify-end items-center px-3 py-5">
            <div className="mr-3 self-center" style={{ color: "#0b3d33" }}>
              Add event on {selectedDateStr.toLowerCase()}
            </div>
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform"
              style={{
                background: "#0a6a56",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
              }}
            >
              ＋
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Schedule;
