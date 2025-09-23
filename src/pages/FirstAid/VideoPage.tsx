import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../../components/firstAid/VideoPlayer";
import VideoDetails from "../../components/firstAid/VideoDetails";
import RelatedVideos from "../../components/firstAid/RelatedVideos";
import Navbar from "../../components/layout/Navbar";
import GameFooter from "../../components/layout/GameFooter";
import sampleVideos from "../../assets/temps/sampleVideos.json";

const VideoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      const video = sampleVideos.find((v) => v.id === parseInt(id));
      if (video) {
        setCurrentVideo(video);
        // Get related videos (same category, excluding current video)
        const related = sampleVideos
          .filter((v) => v.category === video.category && v.id !== video.id)
          .slice(0, 5);
        setRelatedVideos(related);
      }
    }
  }, [id]);

  const handleRelatedVideoClick = (videoId: number) => {
    navigate(`/video/${videoId}`);
  };

  if (!currentVideo) {
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
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ color: "white", fontSize: "18px" }}>Video not found</div>
          </div>
          <div style={{ width: "100%" }}>
            <GameFooter />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar currentPage="first-aid" />
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #50BFA5, #D3D42F)",
          margin: 0,
          paddingTop: "104px", // Top padding for navbar
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            paddingLeft: "24px",
            paddingRight: "24px",
            paddingBottom: "24px",
          }}
        >
          {/* Left Column - Video Player and Details */}
          <div
            style={{
              flex: "2",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Video Player */}
            <VideoPlayer
              videoUrl={
                currentVideo.videoUrl ||
                "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
              }
              title={currentVideo.title}
            />

            {/* Video Details */}
            <VideoDetails
              title={currentVideo.title}
              description={currentVideo.description}
              detailedDescription={currentVideo.detailedDescription || currentVideo.description}
              views={currentVideo.views}
              rating={currentVideo.rating}
              uploadDate={currentVideo.uploadDate || "2024-01-15"}
              instructor={currentVideo.instructor || "Dr. Sarah Johnson"}
              instructorTitle={currentVideo.instructorTitle || "Emergency Medicine Specialist"}
              tags={currentVideo.tags || ["First Aid", "Emergency"]}
            />
          </div>

          {/* Right Column - Related Videos */}
          <div
            style={{
              flex: "1",
              minWidth: "300px",
            }}
          >
            <RelatedVideos videos={relatedVideos} onVideoClick={handleRelatedVideoClick} />
          </div>
        </div>
        <div style={{ width: "100%" }}>
          <GameFooter />
        </div>
      </div>
    </>
  );
};

export default VideoPage;
