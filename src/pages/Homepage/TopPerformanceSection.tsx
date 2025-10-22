// TopPerformanceSection.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface PerformanceCardData {
  userId: string;
  userName: string;
  totalPoints: number;
  rank: number;
  avatar: string;
  isFeatured: boolean;
}

const TopPerformanceSection: React.FC = () => {
  const navigate = useNavigate();
  const [topPerformers, setTopPerformers] = useState<PerformanceCardData[]>([]);
  const [challengeTitle, setChallengeTitle] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate avatar URL with colored background
  const getAvatarUrl = (userName: string, userId: string): string => {
    const colors = ["4F46E5", "DC2626", "059669", "D97706", "7C3AED", "EC4899", "10B981"];
    const colorIndex = userId.charCodeAt(0) % colors.length;
    const initial = userName?.charAt(0).toUpperCase() || "U";
    return `https://ui-avatars.com/api/?name=${initial}&background=${colors[colorIndex]}&color=fff&size=300&bold=true`;
  };


  const resolveAvatarUrl = (profilePicture: string | null | undefined, userName: string, userId: string): string => {
    // If user has a real avatar, use it
    if (profilePicture) {
      if (profilePicture.startsWith('/')) {
        return `${import.meta.env.VITE_API_URL || ''}${profilePicture}`;
      }
      return profilePicture;
    }
    
    // Fallback to UI Avatars with user's initial
    return getAvatarUrl(userName, userId);
  };

  // ✅ Extract first name from full name (for Vietnamese names, take the last word)
  const extractFirstName = (fullName: string): string => {
    if (!fullName) return fullName;
    
    const parts = fullName.trim().split(/\s+/);
    
    // If only one word, return it
    if (parts.length === 1) return parts[0];
    
    // For Vietnamese names, the first name is usually the last word
    return parts[parts.length - 1];
  };

  // ✅ Fetch user details from auth service
  const fetchUserDetails = async (userId: string): Promise<{ name: string; fullName?: string; avatar?: string }> => {
    try {
      const { authService } = await import("../../services/authService");
      const userInfo = await authService.getUser(userId);
      const fullName = userInfo.fullName || userInfo.userName || `User ${userId.substring(0, 8)}`;
      
      // If name is too long (more than 15 characters), use only first name
      const displayName = fullName.length > 15 ? extractFirstName(fullName) : fullName;
      
      return {
        name: displayName,
        fullName: userInfo.fullName,
        avatar: userInfo.profilePicture || undefined, // ✅ Get real avatar
      };
    } catch (error) {
      console.warn(`⚠️ Failed to fetch user info for ${userId}:`, error);
      return {
        name: `User ${userId.substring(0, 8)}`,
      };
    }
  };

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import services
        const { challengeService } = await import("../../services/challengeService");

        // Get all challenges
        const allChallenges = await challengeService.getAllChallenges();
        console.log("📊 All challenges:", allChallenges);
        
        if (allChallenges.length === 0) {
          console.error("❌ No challenges available");
          setError("No challenges found");
          setLoading(false);
          return;
        }

        // Fetch participant count for ALL challenges to find the most popular one
        const challengesWithParticipants = await Promise.all(
          allChallenges.map(async (challenge) => {
            try {
              const participants = await challengeService.getParticipantsByChallengeId(challenge.id);
              console.log(`👥 Challenge ${challenge.title}: ${participants.length} participants`);
              return {
                ...challenge,
                participantCount: participants.length,
                participants: participants,
              };
            } catch (err) {
              console.warn(`Failed to fetch participants for challenge ${challenge.id}:`, err);
              return {
                ...challenge,
                participantCount: 0,
                participants: [],
              };
            }
          })
        );

        console.log("📈 Challenges with participant counts:", challengesWithParticipants);

        // Filter out challenges with NO participants
        const challengesWithUsers = challengesWithParticipants.filter(c => c.participantCount > 0);
        
        if (challengesWithUsers.length === 0) {
          console.error("❌ No challenges with participants found");
          setError("No active participants yet");
          setLoading(false);
          return;
        }

        // Sort by participant count and get the most popular challenge
        const topChallenge = challengesWithUsers
          .sort((a, b) => {
            // Prioritize challenges with more participants
            if (b.participantCount !== a.participantCount) {
              return b.participantCount - a.participantCount;
            }
            // Then by start date (most recent first)
            return new Date(b.startAt || 0).getTime() - new Date(a.startAt || 0).getTime();
          })[0];

        console.log("🏆 Selected challenge for top performance:", topChallenge);
        console.log(`✅ Challenge has ${topChallenge.participantCount} participants`);

        // Store challenge info
        setChallengeTitle(topChallenge.title);
        setChallengeId(topChallenge.id);

        // Fetch participants to get totalPoints
        const participants = await challengeService.getParticipantsByChallengeId(topChallenge.id);
        console.log(`👥 Participants with points:`, participants);

        // Fetch leaderboard for the selected challenge
        console.log(`🔍 Fetching leaderboard for challenge: ${topChallenge.title} (${topChallenge.id})`);
        
        let leaderboard: any[] = [];
        
        // Try to get leaderboard from API first
        try {
          leaderboard = await challengeService.getLeaderboard(topChallenge.id);
          console.log(`📊 Leaderboard from API:`, leaderboard);
        } catch (err) {
          console.warn(`⚠️ Leaderboard API failed, building from participants:`, err);
        }

        // If leaderboard is empty, build it from participants
        if (!leaderboard || leaderboard.length === 0) {
          console.log(`🔧 Building leaderboard manually from participants`);
          
          if (participants && participants.length > 0) {
            leaderboard = participants
              .filter(p => p.totalPoints && p.totalPoints > 0)
              .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
              .map((p, index) => ({
                userId: p.userId,
                userName: undefined, // Will be fetched from auth service
                totalPoints: p.totalPoints || 0,
                rank: index + 1,
              }));
            console.log(`✅ Built leaderboard from participants:`, leaderboard);
          }
        }

        // Create participant map for quick lookup
        const participantMap = new Map(participants.map(p => [p.userId, p]));
        
        // Get top 3 performers
        const top3 = leaderboard
          .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
          .slice(0, 3);

        console.log(`🥇 Top 3 performers (before user details):`, top3);

        if (top3.length === 0) {
          console.warn(`⚠️ No performers with points in this challenge`);
          setError("No top performers available yet");
          setLoading(false);
          return;
        }

        // ✅ Fetch user details for all top 3 performers
        const userDetailsPromises = top3.map(entry => fetchUserDetails(entry.userId));
        const userDetailsArray = await Promise.all(userDetailsPromises);

        console.log(`✅ Fetched user details:`, userDetailsArray);

        // Transform to performance cards with real user names and points
        const performersData: PerformanceCardData[] = top3.map((user, index) => {
          const userDetails = userDetailsArray[index];
          const participant = participantMap.get(user.userId);
          
          // Use totalPoints from either leaderboard or participant data
          const points = user.totalPoints || participant?.totalPoints || 0;
          
          return {
            userId: user.userId,
            userName: userDetails.name,
            totalPoints: points,
            rank: index + 1,
            avatar: resolveAvatarUrl(userDetails.avatar, userDetails.name, user.userId), // ✅ Use real avatar
            isFeatured: index === 0, // Top 1 is featured (will be in middle)
          };
        });

        // ✅ Reorder: [Top 2, Top 1, Top 3] so Top 1 is in the middle
        const reorderedPerformers: PerformanceCardData[] = [];
        if (performersData[1]) reorderedPerformers.push(performersData[1]); // Top 2 - Left
        if (performersData[0]) reorderedPerformers.push(performersData[0]); // Top 1 - Middle (Featured)
        if (performersData[2]) reorderedPerformers.push(performersData[2]); // Top 3 - Right

        console.log("✅ Top performers cards with real data (reordered):", reorderedPerformers);
        setTopPerformers(reorderedPerformers);

      } catch (err) {
        console.error("❌ Error fetching top performers:", err);
        setError("Failed to load top performers");
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, []);

  const handleViewMore = () => {
    if (challengeId) {
      navigate(`/leaderboard/${challengeId}`);
    } else {
      navigate("/challenges");
    }
  };

  const handleCardClick = () => {
    if (challengeId) {
      navigate(`/leaderboard/${challengeId}`);
    }
  };

  if (loading) {
    return (
      <section
        className="top-performance-section relative py-[100px] rounded-[100px] my-[50px]"
        style={{
          backgroundImage: "url('/assets/Ellipse.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <img
          src="/assets/Asset 10.svg"
          alt="mask"
          className="absolute right-[100px] top-[1px] object-contain z-10"
        />
        <h2 className="top-performance-title text-white text-center font-bold text-[48px] mb-[50px]">
          Top Performance
        </h2>
        <div style={{ textAlign: "center", color: "white", fontSize: "18px" }}>
          Loading top performers...
        </div>
      </section>
    );
  }

  if (error || topPerformers.length === 0) {
    return (
      <section
        className="top-performance-section relative py-[100px] rounded-[100px] my-[50px]"
        style={{
          backgroundImage: "url('/assets/Ellipse.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <img
          src="/assets/Asset 10.svg"
          alt="mask"
          className="absolute right-[100px] top-[1px] object-contain z-10"
        />
        <h2 className="top-performance-title text-white text-center font-bold text-[48px] mb-[50px]">
          Top Performance
        </h2>
        
        {/* Placeholder Cards */}
        <div className="performance-cards flex justify-center gap-10 max-w-[1200px] mx-auto px-5 flex-wrap">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className={`performance-card ${
                index === 2 ? "featured bg-[#FF9C50] text-white scale-[1.1]" : "bg-white"
              } rounded-[16px] p-[30px] text-center ${
                index === 2 ? "w-[344px]" : "w-[312px]"
              } relative`}
              style={{
                boxShadow: index === 2
                  ? "0 10px 30px rgba(255, 156, 80, 0.3)"
                  : "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                className={`performance-avatar ${
                  index === 2 ? "w-[292px] h-[292px]" : "w-[265px] h-[265px]"
                } rounded-full -mt-[50px] mx-auto mb-5`}
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: index === 2 ? "4px solid white" : "3px solid #e5e7eb",
                }}
              />
              <h4
                className={`performance-name font-bold text-[24px] mb-2 ${
                  index === 2 ? "text-white" : "text-gray-800"
                }`}
              >
                Coming Soon
              </h4>
              <h3
                className={`performance-title font-bold text-[36px] mb-3 ${
                  index === 2 ? "text-white" : "text-gray-900"
                }`}
              >
                Join Challenge
              </h3>
              <p
                className={`performance-description ${
                  index === 2 ? "text-white/90" : "text-gray-600"
                }`}
                style={{ fontSize: "14px", lineHeight: "1.5" }}
              >
                Be the first to join a challenge and compete for the top spot! Complete tasks to earn points and showcase your achievements.
              </p>
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                {index === 1 ? "🥇" : index === 2 ? "🥈" : "🥉"}
              </div>
            </div>
          ))}
        </div>

        <button
          className="view-more-btn bg-transparent border border-[#AEFFC4] text-[#AEFFC4] rounded-[40px] py-[8px] px-[22px] text-[16px] font-medium hover:bg-[#AEFFC4] hover:text-black transition-all"
          onClick={handleViewMore}
        >
          View more →
        </button>
      </section>
    );
  }

  return (
    <section
      className="top-performance-section relative py-[100px] rounded-[100px] my-[50px]"
      style={{
        backgroundImage: "url('/assets/Ellipse.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <img
        src="/assets/Asset 10.svg"
        alt="mask"
        className="absolute right-[100px] top-[1px] object-contain z-10"
      />
      <h2 className="top-performance-title text-white text-center font-bold text-[48px] mb-[50px]">
        Top performance
      </h2>

      <div className="performance-cards flex justify-center gap-10 max-w-[1200px] mx-auto px-5 flex-wrap">
        {topPerformers.map((performer) => (
          <div
            key={`${performer.userId}-${performer.rank}`}
            className={`performance-card ${
              performer.isFeatured ? "featured" : ""
            } ${
              performer.isFeatured ? "bg-[#FF9C50] text-white" : "bg-white"
            } rounded-[16px] p-[30px] text-center ${
              performer.isFeatured ? "w-[380px] scale-[1.1]" : "w-[350px]"
            } relative cursor-pointer transition-transform hover:scale-105`}
            onClick={handleCardClick}
          >
            {/* Avatar */}
            <div
              className={`performance-avatar ${
                performer.isFeatured ? "w-[250px] h-[250px]" : "w-[230px] h-[230px]"
              } rounded-full -mt-[50px] mx-auto mb-5 overflow-hidden`}
              style={{
                backgroundImage: `url(${performer.avatar})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* User Name */}
            <h4 className="performance-name font-bold text-[24px] mb-2">
              {performer.userName}
            </h4>

            {/* Rank Title with Position Indicator */}
            <h3 className="performance-title font-bold text-[48px] mb-2">
              Top {performer.rank}
            </h3>

            {/* Challenge Name Below Top - ALWAYS SHOW */}
            <p className={`text-[14px] font-medium mb-3 ${
              performer.isFeatured ? "text-white/80" : "text-gray-500"
            }`} style={{ minHeight: "20px" }}>
              {challengeTitle || "Challenge"}
            </p>

            {/* Points Display - Only show if user has points */}
            {performer.totalPoints > 0 && (
              <div style={{
                backgroundColor: performer.isFeatured ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                color: performer.isFeatured ? "white" : "#1f2937",
                padding: "6px 14px",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "14px",
                marginBottom: "12px",
                display: "inline-block"
              }}>
                {performer.totalPoints} points
              </div>
            )}

            {/* Description */}
            <p className="performance-description">
              {performer.rank === 1 
                ? "Outstanding performance! Leading the challenge with exceptional dedication and consistent effort."
                : performer.rank === 2
                ? "Excellent work! Close behind the leader with impressive results and dedication to the challenge goals."
                : "Great effort! Showing strong commitment and steady progress throughout the entire challenge period."
              }
            </p>
          </div>
        ))}
      </div>

      <button
        className="view-more-btn bg-[#AEFFC4] rounded-[82.5px] py-[15px] px-[40px] text-black font-bold text-[24px] mx-auto block mt-10 hover:bg-[#9EEF9F] transition-colors cursor-pointer"
        onClick={handleViewMore}
      >
        View more →
      </button>
    </section>
  );
};

export default TopPerformanceSection;