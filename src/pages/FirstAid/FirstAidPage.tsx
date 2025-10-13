import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FirstAidHeader from "../../components/firstAid/firstAidHeader";
import FirstAidSearchBar from "../../components/firstAid/firstAidSearchBar";
import VideoCard from "../../components/firstAid/VideoCard";
import Pagination from "../../components/ui/Pagination";
import GameFooter from "../../components/layout/GameFooter";
import { mediaService } from "../../services/mediaService";
import type { MediaItem } from "../../models/media";

const FirstAidPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'likes' | 'title'>('date');
  const videosPerPage = 6; // 2 rows × 3 videos per page for optimal layout

  useEffect(() => {
    fetchVideos();
  }, [currentPage, searchQuery, sortBy]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getAllVideos(
        currentPage, 
        videosPerPage,
        searchQuery,
        sortBy
      );
      setVideos(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSortChange = (newSortBy: 'date' | 'views' | 'likes' | 'title') => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #50BFA5, #D3D42F)",
          margin: 0,
          display: "flex",
          flexDirection: "column",
          paddingTop: "80px", // Account for fixed navbar
        }}
      >
        <div style={{ paddingLeft: "24px", paddingRight: "24px" }}>
          <FirstAidHeader />
        </div>

        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "32px",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          <FirstAidSearchBar 
            onSearch={handleSearch}
            onSortChange={handleSortChange}
            currentSort={sortBy}
          />
        </div>

        {/* Results Count */}
        {!loading && (
          <div
            style={{
              textAlign: "center",
              color: "white",
              fontSize: "16px",
              marginBottom: "16px",
              fontWeight: "500",
            }}
          >
            {searchQuery ? (
              <span>Found {totalCount} video{totalCount !== 1 ? 's' : ''} for "{searchQuery}"</span>
            ) : (
              <span>Showing {videos.length} of {totalCount} videos</span>
            )}
          </div>
        )}

        {/* Video Grid */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            paddingLeft: "24px",
            paddingRight: "24px",
          }}
        >
          {/* Loading State */}
          {loading ? (
            <div style={{ color: "white", fontSize: "18px", padding: "40px" }}>
              Loading videos...
            </div>
          ) : videos.length === 0 ? (
            <div style={{ 
              color: "white", 
              fontSize: "18px", 
              padding: "40px",
              textAlign: "center" 
            }}>
              {searchQuery ? (
                <>
                  <div style={{ marginBottom: "8px" }}>
                    No videos found for "{searchQuery}"
                  </div>
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>
                    Try different keywords or browse all videos
                  </div>
                </>
              ) : (
                "No videos available"
              )}
            </div>
          ) : (
            <>
              {/* Video Cards Grid */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "24px",
                  maxWidth: "1200px",
                  width: "100%",
                }}
              >
                {videos.map((video) => (
                  <div key={video.id} style={{ flex: "1 1 calc(33.333% - 16px)", minWidth: "300px" }}>
                    <VideoCard
                      id={video.id}
                      title={video.title || "Untitled"}
                      description={video.description || "No description available"}
                      thumbnail={video.thumbnail || "https://via.placeholder.com/400x300"}
                      views={video.views}
                      rating={4.5}
                      duration={video.duration || "N/A"}
                      category={video.category || "Uncategorized"}
                      onClick={() => handleVideoClick(video.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
        <div style={{ width: "100%" }}>
          <GameFooter />
        </div>
      </div>
    </>
  );
};

export default FirstAidPage;
