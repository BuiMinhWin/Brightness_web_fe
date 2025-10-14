import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../../components/firstAid/VideoPlayer";
import VideoDetails from "../../components/firstAid/VideoDetails";
import RelatedVideos from "../../components/firstAid/RelatedVideos";
import GameFooter from "../../components/layout/GameFooter";
import { mediaService } from "../../services/mediaService";
import type { MediaItem } from "../../models/media";

const VideoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState<MediaItem | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVideo(id);
    }
  }, [id]);

  const fetchVideo = async (videoId: string) => {
    try {
      setLoading(true);
      const video = await mediaService.getVideoById(videoId);
      setCurrentVideo(video);

      // Track view
      await mediaService.viewVideo(videoId);

      // Fetch related videos (same category)
      if (video.category) {
        const allVideos = await mediaService.getAllVideos(1, 20);
        const related = allVideos.items
          .filter((v) => v.category === video.category && v.id !== videoId)
          .slice(0, 5);
        setRelatedVideos(related);
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      setCurrentVideo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRelatedVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  const handleLikeToggle = async () => {
    if (!currentVideo) return;

    try {
      if (isLiked) {
        await mediaService.unlikeVideo(currentVideo.id);
        setIsLiked(false);
        // Update local state
        setCurrentVideo({
          ...currentVideo,
          likes: Math.max(0, currentVideo.likes - 1),
        });
      } else {
        await mediaService.likeVideo(currentVideo.id);
        setIsLiked(true);
        // Update local state
        setCurrentVideo({
          ...currentVideo,
          likes: currentVideo.likes + 1,
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  if (loading) {
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
            paddingTop: "80px",
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
            <div style={{ color: "white", fontSize: "18px" }}>Loading video...</div>
          </div>
          <div style={{ width: "100%" }}>
            <GameFooter />
          </div>
        </div>
      </>
    );
  }

  if (!currentVideo) {
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
            paddingTop: "80px",
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
              videoUrl={currentVideo.url}
              title={currentVideo.title || "Video"}
            />

            {/* Video Details */}
            <VideoDetails
              title={currentVideo.title || "Untitled"}
              description={currentVideo.description || "No description available"}
              detailedDescription={currentVideo.description || "No description available"}
              views={currentVideo.views}
              rating={4.5}
              uploadDate={new Date(currentVideo.createdAt).toLocaleDateString()}
              instructor="BrightNest Team"
              instructorTitle="Health & Fitness Specialist"
              tags={currentVideo.category ? [currentVideo.category] : ["First Aid"]}
              likes={currentVideo.likes}
              isLiked={isLiked}
              onLikeToggle={handleLikeToggle}
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
