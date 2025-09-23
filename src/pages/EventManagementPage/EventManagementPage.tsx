import React, { useState, useEffect } from "react";
import "./EventManagementPage.css";
import GameFooter from "../../components/layout/GameFooter";

interface Event {
  id: number;
  title: string;
  subtitle: string;
  status: string;
  timeRemaining: string;
  participants: string;
  prize: string;
  avatar: string;
  description: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  minPerDay: number;
  howToParticipate: {
    steps: Array<{
      number: number;
      title: string;
      description: string;
    }>;
    rules: string[];
  };
  rewards: {
    grandPrize: {
      amount: string;
      description: string;
    };
    topFinishers: {
      count: number;
      reward: string;
    };
    allCompetitors: {
      reward: string;
    };
  };
}

interface EventModal {
  isOpen: boolean;
  type: "create" | "edit";
  event: Event | null;
}

const EventManagementPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState("Month");

  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: "StepUp Sprint",
      subtitle: "6 August 2025 07:19 AM",
      status: "upcoming",
      timeRemaining: "5 days to start",
      participants: "15",
      prize: "$500",
      avatar: "",
      description: "56 Gaylon Mission Suite 157, Meaghanberg",
      startDate: "2025-08-06",
      endDate: "2025-08-20",
      durationDays: 14,
      minPerDay: 30,
      howToParticipate: {
        steps: [
          { number: 1, title: "Register", description: "Sign up for the challenge" },
          { number: 2, title: "Track Progress", description: "Log your daily activities" },
        ],
        rules: ["Exercise for at least 30 minutes daily", "Upload proof of workout"],
      },
      rewards: {
        grandPrize: { amount: "$500", description: "Cash prize for winner" },
        topFinishers: { count: 10, reward: "Fitness gear" },
        allCompetitors: { reward: "Certificate" },
      },
    },
    {
      id: 2,
      title: "Core Clash",
      subtitle: "16 August 2025 at 5:00 PM",
      status: "upcoming",
      timeRemaining: "10 days to start",
      participants: "20",
      prize: "$300",
      avatar: "",
      description: "853 Moore Flats Suite 158, Sweden",
      startDate: "2025-08-16",
      endDate: "2025-08-30",
      durationDays: 14,
      minPerDay: 45,
      howToParticipate: {
        steps: [
          { number: 1, title: "Join", description: "Register for the program" },
          { number: 2, title: "Practice", description: "Complete daily sessions" },
        ],
        rules: ["Core workout for 45 minutes daily", "Submit daily check-ins"],
      },
      rewards: {
        grandPrize: { amount: "$300", description: "Fitness equipment voucher" },
        topFinishers: { count: 5, reward: "Core training gear" },
        allCompetitors: { reward: "Digital certificate" },
      },
    },
    {
      id: 3,
      title: "The 3-Day Burn",
      subtitle: "22-24 August 2025 at 8:00 PM",
      status: "upcoming",
      timeRemaining: "16 days to start",
      participants: "14",
      prize: "$200",
      avatar: "",
      description: "646 Walter Road Apt. 571, Turks and Caicos Islands",
      startDate: "2025-08-22",
      endDate: "2025-08-25",
      durationDays: 3,
      minPerDay: 60,
      howToParticipate: {
        steps: [
          { number: 1, title: "Register", description: "Sign up for intensive challenge" },
          { number: 2, title: "Complete", description: "Finish daily burn sessions" },
        ],
        rules: ["High intensity workout for 60 minutes daily", "Complete all 3 days"],
      },
      rewards: {
        grandPrize: { amount: "$200", description: "Burn challenge winner prize" },
        topFinishers: { count: 3, reward: "HIIT equipment" },
        allCompetitors: { reward: "Completion badge" },
      },
    },
    {
      id: 4,
      title: "Sweat & Win",
      subtitle: "27 August 2025 at 10:00 PM",
      status: "upcoming",
      timeRemaining: "21 days to start",
      participants: "12",
      prize: "$400",
      avatar: "",
      description: "506 Satterfield Tunnel Apt. 963, San Marino",
      startDate: "2025-08-27",
      endDate: "2025-09-10",
      durationDays: 14,
      minPerDay: 40,
      howToParticipate: {
        steps: [
          { number: 1, title: "Join", description: "Enter the sweat challenge" },
          { number: 2, title: "Sweat", description: "Complete daily workouts" },
        ],
        rules: ["Cardio workout for 40 minutes daily", "Track heart rate"],
      },
      rewards: {
        grandPrize: { amount: "$400", description: "Sweat challenge grand prize" },
        topFinishers: { count: 7, reward: "Cardio equipment" },
        allCompetitors: { reward: "Participation medal" },
      },
    },
  ]);

  const [eventModal, setEventModal] = useState<EventModal>({
    isOpen: false,
    type: "create",
    event: null,
  });

  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    subtitle: "",
    status: "upcoming",
    description: "",
    startDate: "",
    endDate: "",
    durationDays: 0,
    minPerDay: 0,
    prize: "",
    howToParticipate: {
      steps: [{ number: 1, title: "", description: "" }],
      rules: [""],
    },
    rewards: {
      grandPrize: { amount: "", description: "" },
      topFinishers: { count: 0, reward: "" },
      allCompetitors: { reward: "" },
    },
  });

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData((prev) => ({ ...prev, durationDays: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleCreateEvent = () => {
    setEventModal({ isOpen: true, type: "create", event: null });
    setFormData({
      title: "",
      subtitle: "",
      status: "upcoming",
      description: "",
      startDate: "",
      endDate: "",
      durationDays: 0,
      minPerDay: 0,
      prize: "",
      howToParticipate: {
        steps: [{ number: 1, title: "", description: "" }],
        rules: [""],
      },
      rewards: {
        grandPrize: { amount: "", description: "" },
        topFinishers: { count: 0, reward: "" },
        allCompetitors: { reward: "" },
      },
    });
  };

  const handleEditEvent = (event: Event) => {
    setEventModal({ isOpen: true, type: "edit", event });
    setFormData(event);
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((event) => event.id !== eventId));
    }
  };

  const handleSaveEvent = () => {
    if (eventModal.type === "create") {
      const newEvent: Event = {
        ...(formData as Event),
        id: Math.max(...events.map((e) => e.id)) + 1,
        timeRemaining: calculateTimeRemaining(formData.startDate!, formData.status!),
        participants: "0",
        avatar: "",
      };
      setEvents([...events, newEvent]);
    } else {
      setEvents(
        events.map((event) =>
          event.id === eventModal.event?.id ? { ...(formData as Event) } : event
        )
      );
    }
    setEventModal({ isOpen: false, type: "create", event: null });
  };

  const calculateTimeRemaining = (startDate: string, status: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (status === "active") {
      return `${Math.abs(diffDays)} days remaining`;
    } else if (status === "upcoming") {
      return `${diffDays} days to start`;
    }
    return "Completed";
  };

  const addStep = () => {
    const newSteps = [...(formData.howToParticipate?.steps || [])];
    newSteps.push({
      number: newSteps.length + 1,
      title: "",
      description: "",
    });
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        steps: newSteps,
      },
    }));
  };

  const updateStep = (index: number, field: "title" | "description", value: string) => {
    const newSteps = [...(formData.howToParticipate?.steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        steps: newSteps,
      },
    }));
  };

  const removeStep = (index: number) => {
    const newSteps = formData.howToParticipate?.steps.filter((_, i) => i !== index) || [];
    const renumberedSteps = newSteps.map((step, i) => ({ ...step, number: i + 1 }));
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        steps: renumberedSteps,
      },
    }));
  };

  const addRule = () => {
    const newRules = [...(formData.howToParticipate?.rules || [])];
    newRules.push("");
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        rules: newRules,
      },
    }));
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...(formData.howToParticipate?.rules || [])];
    newRules[index] = value;
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        rules: newRules,
      },
    }));
  };

  const removeRule = (index: number) => {
    const newRules = formData.howToParticipate?.rules.filter((_, i) => i !== index) || [];
    setFormData((prev) => ({
      ...prev,
      howToParticipate: {
        ...prev.howToParticipate!,
        rules: newRules,
      },
    }));
  };

  // Calendar functionality
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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

  const getEventForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getEventClass = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("core")) return "event-core-clash";
    if (titleLower.includes("step")) return "event-stepup-sprint";
    if (titleLower.includes("burn")) return "event-3day-burn";
    if (titleLower.includes("sweat")) return "event-sweat-win";
    return "";
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();
    const days = [];

    // Previous month's last days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
      const dayEvents = getEventForDate(date);

      days.push(
        <div key={`prev-${day}`} className="calendar-day other-month">
          <div className="calendar-day-number">{day}</div>
          {dayEvents.map((event) => (
            <div key={event.id} className={`calendar-event ${getEventClass(event.title)}`}>
              {event.title}
            </div>
          ))}
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
      const dayEvents = getEventForDate(date);

      days.push(
        <div key={day} className={`calendar-day ${isToday ? "today" : ""}`}>
          <div className="calendar-day-number">{day}</div>
          {dayEvents.map((event) => (
            <div key={event.id} className={`calendar-event ${getEventClass(event.title)}`}>
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    // Next month's first days
    const totalCells = 42; // 6 rows * 7 days
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
      const dayEvents = getEventForDate(date);

      days.push(
        <div key={`next-${day}`} className="calendar-day other-month">
          <div className="calendar-day-number">{day}</div>
          {dayEvents.map((event) => (
            <div key={event.id} className={`calendar-event ${getEventClass(event.title)}`}>
              {event.title}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  const formatTodayDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return `Today ${today.toLocaleDateString("en-GB", options)}`;
  };

  return (
    <div className="event-management-page">
      <div className="event-management-content">
        {/* Hero Section */}
        <div className="event-management-hero">
          <h1 className="event-management-title">Calendar</h1>
        </div>

        {/* Main Layout */}
        <div className="event-management-main">
          {/* Left Sidebar - Events */}
          <div className="events-sidebar">
            <div className="sidebar-header">
              <button className="add-event-btn" onClick={handleCreateEvent}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
                </svg>
                Add New Event
              </button>
            </div>

            <div className="events-coming-soon">Event coming soon</div>

            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-item" onClick={() => handleEditEvent(event)}>
                  <div className="event-avatar">{event.title.charAt(0)}</div>
                  <div className="event-info">
                    <div className="event-title">{event.title}</div>
                    <div className="event-details">{event.subtitle}</div>
                    <div className="event-location">{event.description}</div>
                    <div className="event-participants">
                      <div className="participant-avatars">
                        <div className="participant-avatar">A</div>
                        <div className="participant-avatar">B</div>
                        <div className="participant-avatar">C</div>
                      </div>
                      <div className="participant-count">{event.participants}+</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="see-more-btn">See More</button>
          </div>

          {/* Right Side - Calendar */}
          <div className="calendar-section">
            <div className="calendar-header">
              <div className="calendar-controls">
                <div className="today-info">{formatTodayDate()}</div>

                <div className="calendar-nav-wrapper">
                  <button className="calendar-nav-btn prev" onClick={() => navigateMonth("prev")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>

                  <h3 className="calendar-title">
                    {new Date(currentDate).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>

                  <button className="calendar-nav-btn next" onClick={() => navigateMonth("next")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                </div>

                <div className="view-toggles">
                  {["Day", "Week", "Month"].map((view) => (
                    <button
                      key={view}
                      className={`view-toggle ${activeView === view ? "active" : ""}`}
                      onClick={() => setActiveView(view)}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="calendar-grid">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {eventModal.isOpen && (
        <div
          className="modal-overlay"
          onClick={() => setEventModal({ isOpen: false, type: "create", event: null })}
        >
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="event-modal-header">
              <h2 className="event-modal-title">
                {eventModal.type === "create" ? "Create New Event" : "Edit Event"}
              </h2>
              <p className="event-modal-subtitle">
                Fill in the details below to {eventModal.type === "create" ? "create" : "update"}{" "}
                your event
              </p>
            </div>

            <div className="event-modal-content">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="form-section-title">Basic Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Event Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subtitle</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Brief description of the event"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the event"
                  />
                </div>
              </div>

              {/* Event Schedule */}
              <div className="form-section">
                <h3 className="form-section-title">Event Schedule</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Duration (Days)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.durationDays}
                      readOnly
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Minimum Minutes per Day</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.minPerDay}
                      onChange={(e) =>
                        setFormData({ ...formData, minPerDay: parseInt(e.target.value) || 0 })
                      }
                      placeholder="Required daily activity time"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Prize</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.prize}
                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                    placeholder="e.g., $500, Gift voucher, etc."
                  />
                </div>
              </div>

              {/* How to Participate */}
              <div className="form-section">
                <h3 className="form-section-title">How to Participate</h3>

                <label className="form-label">Steps</label>
                <div className="steps-list">
                  {formData.howToParticipate?.steps.map((step, index) => (
                    <div key={index} className="step-item">
                      <div className="step-number">{step.number}</div>
                      <div className="step-content">
                        <input
                          type="text"
                          className="form-input step-title-input"
                          value={step.title}
                          onChange={(e) => updateStep(index, "title", e.target.value)}
                          placeholder="Step title"
                        />
                        <input
                          type="text"
                          className="form-input"
                          value={step.description}
                          onChange={(e) => updateStep(index, "description", e.target.value)}
                          placeholder="Step description"
                        />
                      </div>
                      {formData.howToParticipate!.steps.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeStep(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="add-step-btn" onClick={addStep}>
                  + Add Step
                </button>

                <label className="form-label" style={{ marginTop: "24px" }}>
                  Rules
                </label>
                <div className="rules-list">
                  {formData.howToParticipate?.rules.map((rule, index) => (
                    <div key={index} className="rule-item">
                      <input
                        type="text"
                        className="form-input rule-input"
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                        placeholder="Enter rule"
                      />
                      {formData.howToParticipate!.rules.length > 1 && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeRule(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="add-rule-btn" onClick={addRule}>
                  + Add Rule
                </button>
              </div>

              {/* Rewards */}
              <div className="form-section">
                <h3 className="form-section-title">Rewards</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Grand Prize Amount</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.rewards?.grandPrize.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rewards: {
                            ...formData.rewards!,
                            grandPrize: { ...formData.rewards!.grandPrize, amount: e.target.value },
                          },
                        })
                      }
                      placeholder="e.g., $500"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Grand Prize Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.rewards?.grandPrize.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rewards: {
                            ...formData.rewards!,
                            grandPrize: {
                              ...formData.rewards!.grandPrize,
                              description: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Prize description"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Top Finishers Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.rewards?.topFinishers.count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rewards: {
                            ...formData.rewards!,
                            topFinishers: {
                              ...formData.rewards!.topFinishers,
                              count: parseInt(e.target.value) || 0,
                            },
                          },
                        })
                      }
                      placeholder="Number of top finishers"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Top Finishers Reward</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.rewards?.topFinishers.reward}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rewards: {
                            ...formData.rewards!,
                            topFinishers: {
                              ...formData.rewards!.topFinishers,
                              reward: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Reward for top finishers"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">All Competitors Reward</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.rewards?.allCompetitors.reward}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rewards: {
                          ...formData.rewards!,
                          allCompetitors: { reward: e.target.value },
                        },
                      })
                    }
                    placeholder="Reward for all participants"
                  />
                </div>
              </div>
            </div>

            <div className="event-modal-actions">
              <button
                className="modal-btn secondary"
                onClick={() => setEventModal({ isOpen: false, type: "create", event: null })}
              >
                Cancel
              </button>
              <button className="modal-btn primary" onClick={handleSaveEvent}>
                {eventModal.type === "create" ? "Create Event" : "Update Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagementPage;
