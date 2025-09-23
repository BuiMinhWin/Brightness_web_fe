import React, { useState } from "react";
import BlogPost from "../../components/blogs/BlogPost";
import Pagination from "../../components/ui/Pagination";
import PostDialog from "../../components/blogs/PostDialog";
import FAB from "../../components/blogs/FAB";
import samplePosts from "../../assets/temps/samplePosts.json";
import Navbar from "@/components/layout/Navbar";
import GameFooter from "@/components/layout/GameFooter";

const Blogs: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 3;
  const totalPages = 5; // Just for show
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // For now, just for show - in a real app this would fetch new posts
    console.log(`Navigating to page ${page}`);
  };

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPost(null);
  };

  return (
    <>
      <Navbar currentPage="blogs" />
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #5BC17F 17%, rgba(255, 123, 23, 0.3) 54%, #007E85 91%)",
          margin: 0,
          padding: "80px 0 20px", // Add top padding for fixed navbar
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "0 20px",
            boxSizing: "border-box",
          }}
        >
          {samplePosts.map((post, index) => (
            <BlogPost
              key={index}
              user={post.user}
              timestamp={post.timestamp}
              content={post.content}
              interactions={post.interactions}
              onClick={() => handlePostClick(post)}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Post Dialog */}
        {selectedPost && (
          <PostDialog post={selectedPost} isOpen={isDialogOpen} onClose={handleCloseDialog} />
        )}

        {/* Floating Action Button */}
        <FAB />
      </div>
      <GameFooter />
    </>
  );
};

export default Blogs;
