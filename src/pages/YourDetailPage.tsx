import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import './YourDetailPage.css';
import GameFooter from '../components/layout/GameFooter';

interface YourDetailPageProps {
  onNavigateBack: () => void;
  onNavigateToLeaderboard: () => void;
  missionId?: number;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started';
  icon: string;
}

interface MissionData {
  id: number;
  title: string;
  duration: string;
  participants: number;
  streak: number;
  tasksCompleted: number;
  totalTasks: number;
  overallProgress: number;
  todayChallenge: Challenge;
  allChallenges: Challenge[];
}

const YourDetailPage: React.FC<YourDetailPageProps> = ({ onNavigateBack, onNavigateToLeaderboard, missionId = 1 }) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'leaderboard'>('progress');

  // Mock data - in real app this would come from database based on missionId
  const missionData: MissionData = {
    id: missionId,
    title: 'Summer Fitness Challenge',
    duration: '30 Days',
    participants: 156,
    streak: 12,
    tasksCompleted: 18,
    totalTasks: 30,
    overallProgress: 60,
    todayChallenge: {
      id: 1,
      name: 'Run 5K or Walk 10K',
      description: 'Complete your cardio goal for today',
      status: 'in-progress',
      icon: '🏃'
    },
    allChallenges: [
      {
        id: 1,
        name: 'Morning Yoga Session',
        description: 'Complete 30-minute yoga routine',
        status: 'completed',
        icon: '✓'
      },
      {
        id: 2,
        name: 'Strength Training',
        description: 'Complete upper body workout',
        status: 'in-progress',
        icon: '▶'
      },
      {
        id: 3,
        name: 'Meditation Session',
        description: '15-minute mindfulness practice',
        status: 'not-started',
        icon: '○'
      }
    ]
  };

  const handleMarkComplete = () => {
    // Handle marking today's challenge as complete
    console.log('Marking challenge as complete');
  };

  const handlePause = () => {
    // Handle pausing the challenge
    console.log('Pausing challenge');
  };

  const handleLeaderboardClick = () => {
    setActiveTab('leaderboard');
    onNavigateToLeaderboard();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '▶';
      case 'not-started':
        return '○';
      default:
        return '○';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'in-progress':
        return 'in-progress';
      case 'not-started':
        return 'not-started';
      default:
        return 'not-started';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'done';
      case 'in-progress':
        return 'in-progress';
      case 'not-started':
        return 'not-started';
      default:
        return 'not-started';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Done';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      default:
        return 'Not Started';
    }
  };

  return (
    <div className="your-detail-page">
      <Navbar currentPage="gamification" />
      <button className="back-button" onClick={onNavigateBack}>
        ← Back
      </button>
      <div className="your-detail-content">
        {/* Header */}
        <div className="detail-header">
          <button className="back-button" onClick={onNavigateBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          
          <div className="header-info">
            <h1 className="challenge-title">{missionData.title}</h1>
            <p className="challenge-meta">
              {missionData.duration} • {missionData.participants} Participants
            </p>
          </div>
          
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span>{missionData.streak} Day Streak</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 3V21L12 18L21 21V3H3Z" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            My Progress
          </button>
          <button 
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={handleLeaderboardClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Leaderboard
          </button>
        </div>

        {activeTab === 'progress' && (
          <>
            {/* Progress Overview */}
            <div className="progress-overview">
              <div className="overview-header">
                <h2 className="overview-title">Challenge Progress</h2>
                <div className="task-counter">
                  <span className="task-count">{missionData.tasksCompleted}/{missionData.totalTasks}</span>
                  <span className="task-label">Tasks Completed</span>
                </div>
              </div>

              <div className="progress-bar-section">
                <div className="progress-label">
                  <span className="progress-title">Overall Progress</span>
                  <span className="progress-percentage">{missionData.overallProgress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${missionData.overallProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="progress-stats">
                <div className="stat-item">
                  <span className="stat-number">18</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">5</span>
                  <span className="stat-label">In Progress</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">7</span>
                  <span className="stat-label">Not Started</span>
                </div>
              </div>
            </div>

            {/* Today's Challenge */}
            <div className="todays-challenge">
              <div className="challenge-header">
                <h3 className="challenge-section-title">Today's Challenge</h3>
                <div className="time-remaining">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>18h 4m left</span>
                </div>
              </div>

              <div className="challenge-item">
                <div className="challenge-icon">
                  🏃
                </div>
                <div className="challenge-details">
                  <h4 className="challenge-name">{missionData.todayChallenge.name}</h4>
                  <p className="challenge-description">{missionData.todayChallenge.description}</p>
                </div>
              </div>

              <div className="action-buttons">
                <button className="complete-button" onClick={handleMarkComplete}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Mark Complete
                </button>
                <button className="pause-button" onClick={handlePause}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* All Challenges */}
            <div className="all-challenges">
              <h3 className="all-challenges-title">All Challenges</h3>
              
              {missionData.allChallenges.map((challenge) => (
                <div key={challenge.id} className="challenge-list-item">
                  <div className={`status-icon ${getStatusClass(challenge.status)}`}>
                    {getStatusIcon(challenge.status)}
                  </div>
                  
                  <div className="challenge-info">
                    <h4 className="challenge-list-name">{challenge.name}</h4>
                    <p className="challenge-list-description">{challenge.description}</p>
                  </div>
                  
                  <div className={`status-badge ${getStatusBadgeClass(challenge.status)}`}>
                    {getStatusText(challenge.status)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-content">
            {/* This content will be handled by navigation to LeaderboardPage */}
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '40px', 
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#6b7280', margin: 0 }}>
                Redirecting to leaderboard...
              </h3>
            </div>
          </div>
        )}
      </div>

      <GameFooter />
    </div>
  );
};

export default YourDetailPage;