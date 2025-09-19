import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import GameFooter from '../../components/layout/GameFooter';
import './LeaderboardPage.css';
import { ArrowLeft } from 'lucide-react';

interface LeaderboardEntry {
  id: number;
  rank: number;
  name: string;
  points: number;
  avatar: string;
  isCurrentUser?: boolean;
}

interface MissionData {
  id: number;
  title: string;
  duration: string;
  participants: number;
  streak: number;
}

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { missionId } = useParams<{ missionId: string }>();
  const [activeTab, setActiveTab] = useState<'today' | 'this-week' | 'all-time'>('today');

  // Convert missionId param từ string sang number (fallback 1)
  const missionIdNum = missionId ? parseInt(missionId, 10) : 1;

  // Mock mission data
  const missionData: MissionData = {
    id: missionIdNum,
    title: 'Summer Fitness Challenge',
    duration: '30 Days',
    participants: 156,
    streak: 12,
  };

  // Mock leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    { id: 1, rank: 1, name: 'Maxwell', points: 2304, avatar: '/api/placeholder/60/60' },
    { id: 2, rank: 2, name: 'Camelia', points: 1570, avatar: '/api/placeholder/60/60' },
    { id: 3, rank: 3, name: 'Wilson', points: 1134, avatar: '/api/placeholder/60/60' },
    { id: 4, rank: 4, name: 'Jessica Anderson', points: 992, avatar: '/api/placeholder/60/60' },
    { id: 5, rank: 5, name: 'Sophia Anderson', points: 584, avatar: '/api/placeholder/60/60' },
    { id: 6, rank: 6, name: 'Ethan Carter', points: 548, avatar: '/api/placeholder/60/60' },
    { id: 7, rank: 7, name: 'Liam Johnson', points: 580, avatar: '/api/placeholder/60/60' },
    { id: 8, rank: 8, name: 'Oliver Smith', points: 578, avatar: '/api/placeholder/60/60' },
  ];

  const currentUserData: LeaderboardEntry = {
    id: 999,
    rank: 15,
    name: 'You',
    points: 253,
    avatar: '/api/placeholder/60/60',
    isCurrentUser: true,
  };

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  return (
    <div className="leaderboard-page">
      <Navbar currentPage="gamification" />

      <div className="leaderboard-content">
        {/* Header */}
        <div className="leaderboard-header">
          <button 
            onClick={() => navigate(`/your-detail/${missionId}`)} 
            className="back-button"
          >
            <ArrowLeft size={24} />
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
        <div className="leaderboard-tabs">
          <button
            className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            Today
          </button>
          <button
            className={`tab-button ${activeTab === 'this-week' ? 'active' : ''}`}
            onClick={() => setActiveTab('this-week')}
          >
            This week
          </button>
          <button
            className={`tab-button ${activeTab === 'all-time' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-time')}
          >
            All time
          </button>
        </div>

        {/* Top 3 Podium */}
        <div className="top-three-container">
          <h2 className="top-title">TOP 10</h2>

          <div className="podium">
            {/* Second Place */}
            <div className="podium-place second">
              <div className="podium-avatar">
                <img src={topThree[1]?.avatar || '/api/placeholder/60/60'} alt={topThree[1]?.name} />
              </div>
              <div className="podium-rank">2</div>
              <div className="podium-name">{topThree[1]?.name}</div>
              <div className="podium-points">• {topThree[1]?.points}</div>
            </div>

            {/* First Place */}
            <div className="podium-place first">
              <div className="podium-avatar">
                <img src={topThree[0]?.avatar || '/api/placeholder/60/60'} alt={topThree[0]?.name} />
              </div>
              <div className="podium-rank">1</div>
              <div className="podium-name">{topThree[0]?.name}</div>
              <div className="podium-points">• {topThree[0]?.points}</div>
            </div>

            {/* Third Place */}
            <div className="podium-place third">
              <div className="podium-avatar">
                <img src={topThree[2]?.avatar || '/api/placeholder/60/60'} alt={topThree[2]?.name} />
              </div>
              <div className="podium-rank">3</div>
              <div className="podium-name">{topThree[2]?.name}</div>
              <div className="podium-points">• {topThree[2]?.points}</div>
            </div>
          </div>
        </div>

        {/* Rest of Leaderboard */}
        <div className="leaderboard-list">
          {restOfLeaderboard.map((entry) => (
            <div key={entry.id} className="leaderboard-item">
              <div className="rank-number">{String(entry.rank).padStart(2, '0')}</div>
              <div className="user-avatar">
                <img src={entry.avatar} alt={entry.name} />
              </div>
              <div className="user-info">
                <span className="user-name">{entry.name}</span>
                <span className="user-points">{entry.points} points</span>
              </div>
              <div className="status-indicator">
                {entry.rank <= 5 ? (
                  <div className="status-dot blue"></div>
                ) : (
                  <div className="status-dot red"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Current User Position */}
        <div className="current-user-section">
          <div className="separator-dots">
            <span>•</span>
            <span>•</span>
            <span>•</span>
          </div>

          <div className="you-are-here">
            <span>You are here!!</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <div className="current-user-item">
            <div className="rank-number">{String(currentUserData.rank).padStart(2, '0')}</div>
            <div className="user-avatar current">
              <img src={currentUserData.avatar} alt={currentUserData.name} />
            </div>
            <div className="user-info">
              <span className="user-name current">{currentUserData.name}</span>
              <span className="user-points">{currentUserData.points} points</span>
            </div>
            <div className="status-indicator">
              <div className="status-dot pink"></div>
            </div>
          </div>
        </div>
      </div>

      <GameFooter />
    </div>
  );
};

export default LeaderboardPage;
