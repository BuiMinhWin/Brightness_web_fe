import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FirstAidHeader from "../../components/firstAid/firstAidHeader";
import FirstAidSearchBar from "../../components/firstAid/firstAidSearchBar";
import VideoCard from "../../components/firstAid/VideoCard";
import Pagination from "../../components/ui/Pagination";
import Navbar from "../../components/layout/Navbar";
import GameFooter from "../../components/layout/GameFooter";
import sampleVideos from "../../assets/temps/sampleVideos.json";

const FirstAidPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6; // 2 rows × 3 videos
  const totalPages = Math.ceil(sampleVideos.length / videosPerPage);

  // Calculate which videos to show for current page
  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const currentVideos = sampleVideos.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleVideoClick = (videoId: number) => {
    navigate(`/video/${videoId}`);
  };

  return (
    <>
      <Navbar currentPage="first-aid" />
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
          <FirstAidSearchBar />
        </div>

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
            {currentVideos.map((video) => (
              <div key={video.id} style={{ flex: "1 1 calc(33.333% - 16px)", minWidth: "300px" }}>
                <VideoCard
                  id={video.id}
                  title={video.title}
                  description={video.description}
                  thumbnail={video.thumbnail}
                  views={video.views}
                  rating={video.rating}
                  duration={video.duration}
                  category={video.category}
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
        </div>
        <div style={{ width: "100%" }}>
          <GameFooter />
        </div>
      </div>
    </>
  );
};

export default FirstAidPage;
