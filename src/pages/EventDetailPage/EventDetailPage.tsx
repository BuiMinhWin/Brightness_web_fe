import React, { useState } from "react";
import {
  ArrowLeft,
  Clock,
  Users,
  Trophy,
  Calendar,
  Star,
  CheckCircle,
  AlertTriangle,
  Gift,
} from "lucide-react";
import "./EventDetailPage.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";

// Định nghĩa kiểu dữ liệu Event
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
    steps: Array<{ number: number; title: string; description: string }>;
    rules: string[];
  };
  rewards: {
    grandPrize: { amount: string; description: string };
    topFinishers: { count: number; reward: string };
    allCompetitors: { reward: string };
  };
}

// Mock event data (demo)
const mockEvent: Event = {
  id: 1,
  title: "Body Burn Challenge",
  subtitle: "Total Body Strength Tournament",
  status: "Ongoing",
  timeRemaining: "3 days remaining",
  participants: "547 participants",
  prize: "$500 prize pool",
  avatar: "BB",
  description:
    "Join thousands of fitness enthusiasts in our most exciting 30-day challenge yet! " +
    "This comprehensive program combines strength training, cardio workouts, and mindfulness practices " +
    "to help you achieve your fitness goals. Whether you're a beginner or an experienced athlete, " +
    "this challenge adapts to your fitness level and pushes you to new heights.",
  startDate: "March 1, 2024",
  endDate: "March 30, 2024",
  durationDays: 30,
  minPerDay: 45,
  howToParticipate: {
    steps: [
      {
        number: 1,
        title: "Complete Daily Workouts",
        description: "Follow the daily workout routine (30-45 minutes each day)",
      },
      {
        number: 2,
        title: "Track Your Progress",
        description: "Log your workouts and upload progress photos weekly",
      },
      {
        number: 3,
        title: "Stay Consistent",
        description: "Complete at least 25 out of 30 days to qualify for rewards",
      },
    ],
    rules: [
      "No skipping more than 5 consecutive days",
      "Must complete minimum 80% of each workout",
      "Progress photos required weekly for verification",
      "Follow community guidelines and support others",
    ],
  },
  rewards: {
    grandPrize: {
      amount: "$300",
      description: "$300 in cash + 2 months premium membership",
    },
    topFinishers: {
      count: 10,
      reward: "Premium workout gear",
    },
    allCompetitors: {
      reward: "Digital badge & certificate",
    },
  },
};

// Props
interface EventDetailPageProps {
  onNavigateBack: () => void;
  eventId?: number;
}


const EventDetailPage: React.FC = () => {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [event] = useState<Event>(mockEvent); // In real app: fetch by eventId
  const navigate = useNavigate();


  // Helpers
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "#10b981";
      case "upcoming":
        return "#f59e0b";
      case "finished":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "#dcfce7";
      case "upcoming":
        return "#fef3c7";
      case "finished":
        return "#f3f4f6";
      default:
        return "#f3f4f6";
    }
  };

    const handleYoursClick = () => {
    navigate("/gamification");
  };

  const handleJoinEvent = () => {
    setShowJoinDialog(false);
    <button className="back-button" onClick={() => navigate('/gamification')}></button>
    alert(`Successfully joined ${event.title}!`);
  };

  return (
    
    <div className="event-detail-page">
      {/* Header */}
      <Navbar currentPage="gamification" />
      

      {/* Hero Banner */}
      {/* <div className="hero-banner"> */}
        {/* <div className="hero-overlay"></div> */}
        {/* <div className="hero-content"> */}
          {/* <div className="hero-info"> */}
            {/* <div
              className="event-avatar"
              style={{ backgroundColor: getStatusBg(event.status) }}
            >
              {event.avatar}
            </div> */}
            {/* <div className="hero-text">
              <h1 className="hero-title">{event.title}</h1>
              <p className="hero-subtitle">{event.subtitle}</p>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <Clock size={20} />
              <span>{event.timeRemaining}</span>
            </div> */}
            {/* <div className="stat-item">
              <Users size={20} />
              <span>{event.participants}</span>
            </div>
            <div className="stat-item">
              <Trophy size={20} />
              <span>{event.prize}</span>
            </div> */}
            {/* <div
              className="status-badge"
              style={{
                backgroundColor: getStatusBg(event.status),
                color: getStatusColor(event.status),
              }}
            >
              {event.status}
            </div> */}
          {/* </div> */}
        {/* </div> */}
      {/* </div> */}

      {/* <div className="hero-banner gradient-overlay">
  <div className="hero-overlay"></div>
  
  <div className="hero-content">
    <h1 className="hero-title">
      Transform Your Fitness Journey
    </h1>
    
    <p className="hero-subtitle">
      Join thousands who've achieved their goals with our AI-powered fitness platform
    </p>
    
    <div className="hero-cta">
      <button className="cta-button cta-primary">
        Start Free Trial
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>
      
      <button className="cta-button cta-secondary">
        Learn More
      </button>
    </div>
  </div>
</div> */}

      <div className="event-header">
        <div className="event-header-content">
          <button onClick={handleYoursClick} className="back-button">
            <ArrowLeft size={24} />
          </button>
          <h1 className="header-title">Event Details</h1>
          <div className="header-spacer"></div>
        </div>
      </div>

      <h1 className="hero-title">{event.title}</h1>

      {/* Content */}
      <div className="event-content">
        {/* Event Description */}
        <div className="content-card">
          <div className="card-header">
            <div className="icon-wrapper blue">
              <Star size={20} />
            </div>
            <h2 className="section-title">Event Description</h2>
          </div>
          <p className="description-text">{event.description}</p>
        </div>

        {/* How to Participate */}
        <div className="content-card">
          <div className="card-header">
            <div className="icon-wrapper green">
              <CheckCircle size={20} />
            </div>
            <h2 className="section-title">How to Participate</h2>
          </div>
          <div className="steps-container">
            {event.howToParticipate.steps.map((step) => (
              <div key={step.number} className="step-item">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rules-section">
            <div className="rules-header">
              <AlertTriangle size={20} className="rules-icon" />
              <h3 className="rules-title">Challenge Rules</h3>
            </div>
            <ul className="rules-list">
              {event.howToParticipate.rules.map((rule, index) => (
                <li key={index} className="rule-item">
                  <span className="bullet">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Event Duration */}
        <div className="content-card">
          <div className="card-header">
            <div className="icon-wrapper purple">
              <Calendar size={20} />
            </div>
            <h2 className="section-title">Event Duration</h2>
          </div>
          <div className="duration-stats">
            <div className="duration-stat">
              <div className="stat-number">{event.durationDays}</div>
              <div className="stat-label">Days Total</div>
            </div>
            <div className="duration-stat">
              <div className="stat-number">{event.minPerDay}</div>
              <div className="stat-label">Min/Day</div>
            </div>
          </div>
          <div className="date-info">
            <div className="date-item">
              <div className="date-label">Start Date:</div>
              <div className="date-value">{event.startDate}</div>
            </div>
            <div className="date-item right">
              <div className="date-label">End Date:</div>
              <div className="date-value">{event.endDate}</div>
            </div>
          </div>
        </div>

        {/* Rewards & Prizes */}
        <div className="content-card">
          <div className="card-header">
            <div className="icon-wrapper yellow">
              <Gift size={20} />
            </div>
            <h2 className="section-title">Rewards & Prizes</h2>
          </div>
          <div className="rewards-grid">
            {/* Grand Prize */}
            <div className="reward-card grand-prize">
              <div className="reward-icon">
                <Trophy size={24} />
              </div>
              <h3 className="reward-title">Grand Prize Winner</h3>
              <div className="reward-amount">
                {event.rewards.grandPrize.amount}
              </div>
              <p className="reward-description">
                {event.rewards.grandPrize.description}
              </p>
            </div>

            {/* Top Finishers */}
            <div className="reward-card top-finishers">
              <div className="reward-icon">
                <Star size={24} />
              </div>
              <h3 className="reward-title">
                Top {event.rewards.topFinishers.count} Finishers
              </h3>
              <p className="reward-description">
                {event.rewards.topFinishers.reward}
              </p>
            </div>

            {/* All Competitors */}
            <div className="reward-card all-competitors">
              <div className="reward-icon">
                <CheckCircle size={24} />
              </div>
              <h3 className="reward-title">All Competitors</h3>
              <p className="reward-description">
                {event.rewards.allCompetitors.reward}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="content-card action-section">
          <p className="action-text">
            Ready to transform your fitness journey?
          </p>
          <div className="action-buttons">
            <button
              onClick={() => setShowJoinDialog(true)}
              className="join-button"
            >
              <CheckCircle className="button-icon" size={20} />
              Register to Participate
            </button>
            <button onClick={handleYoursClick} className="back-button-alt">
              Go Back
            </button>
          </div>
          <p className="participation-info">
            Free to join • {event.participants}
          </p>
        </div>
      </div>

      {/* Join Dialog */}
      {showJoinDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h2 className="dialog-title">Join {event.title}?</h2>
            <p className="dialog-text">
              Are you ready to commit to this {event.durationDays}-day challenge?
            </p>
            <div className="dialog-buttons">
              <button
                onClick={() => setShowJoinDialog(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button onClick={handleJoinEvent} className="confirm-button">
                Join Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
