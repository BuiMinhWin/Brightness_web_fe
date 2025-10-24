import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ReviewPostPage.css";
import GameFooter from "../../components/layout/GameFooter";
import { socialService } from "../../services/socialService";
import type { Post } from "../../models/social";
import PostDialog from "../../components/blogs/PostDialog";

interface ReviewPost extends Post {
  author: string;
  category: "health" | "exercise" | "advise";
}

interface ConfirmationModal {
  isOpen: boolean;
  type: "keep" | "delete" | null;
  postId: string | null;
  postTitle: string;
}

const ReviewPostPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [flaggedPosts, setFlaggedPosts] = useState<ReviewPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<ReviewPost | null>(null);

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    type: null,
    postId: null,
    postTitle: "",
  });

  // Load posts on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch flagged posts from API
      const flagged = await socialService.getFlaggedPosts();
      const transformedFlagged: ReviewPost[] = flagged.map((post) => ({
        ...post,
        author: post.userData?.userName || `User ${post.userId.substring(0, 8)}`,
        category: "health" as const, // You might want to derive this from post content or tags
      }));
      setFlaggedPosts(transformedFlagged);
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const postsPerPage = 10;
  const totalPages = Math.ceil(flaggedPosts.length / postsPerPage);

  const handleActionClick = (action: "keep" | "delete", postId: string, postTitle: string) => {
    setConfirmationModal({
      isOpen: true,
      type: action,
      postId: postId,
      postTitle: postTitle,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationModal.postId || !confirmationModal.type) return;

    try {
      if (confirmationModal.type === "keep") {
        // Update post status to approved to dismiss reports
        await socialService.updatePostStatus(confirmationModal.postId, "approved");
        // Remove from flagged posts
        setFlaggedPosts((prev) => prev.filter((p) => p.id !== confirmationModal.postId));
      } else if (confirmationModal.type === "delete") {
        // Soft delete the post
        await socialService.softDeletePost(confirmationModal.postId);
        // Remove from flagged posts
        setFlaggedPosts((prev) => prev.filter((p) => p.id !== confirmationModal.postId));
      }
    } catch (err) {
      console.error("Failed to perform action:", err);
      setError("Failed to perform action. Please try again.");
    }

    setConfirmationModal({ isOpen: false, type: null, postId: null, postTitle: "" });
  };

  const handleCancelAction = () => {
    setConfirmationModal({ isOpen: false, type: null, postId: null, postTitle: "" });
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "health":
        return "category-health";
      case "exercise":
        return "category-exercise";
      case "advise":
        return "category-advise";
      default:
        return "category-health";
    }
  };

  const renderPaginationNumbers = () => {
    const numbers = [];
    const maxVisible = 4;

    for (let i = 1; i <= Math.min(maxVisible, totalPages); i++) {
      numbers.push(
        <button
          key={i}
          className={`pagination-number ${currentPage === i ? "active" : ""}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    if (totalPages > maxVisible) {
      numbers.push(
        <span key="dots" className="pagination-dots">
          ...
        </span>
      );
    }

    return numbers;
  };

  return (
    <div className="review-post-page">
      <div className="review-post-content">
        {/* Hero Section */}
        <div className="review-post-hero">
          <h1 className="review-post-title">Flagged Posts Review</h1>
          <p style={{ color: "white", fontSize: "16px", marginTop: "8px" }}>
            Review posts that have been reported by users ({flaggedPosts.length} {flaggedPosts.length === 1 ? "post" : "posts"})
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "white" }}>
            <p style={{ fontSize: "18px" }}>Loading flagged posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: "center", padding: "40px", color: "#fecaca" }}>
            <p style={{ fontSize: "18px" }}>{error}</p>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && (
          <>
            {flaggedPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "white" }}>
                <p style={{ fontSize: "18px" }}>
                   No flagged posts to review. Great work!
                </p>
              </div>
            ) : (
              <div className="review-posts-grid">
                {flaggedPosts.map((post) => (
                  <div key={post.id} className="review-post-card">
                    <div className="post-info">
                      <h3 className="post-title">{post.title}</h3>
                      <div className={`post-category ${getCategoryClass(post.category)}`}>
                        {post.category}
                      </div>
                      <div className="post-author">{post.author}</div>
                      {post.reportCount !== undefined && (
                        <div
                          style={{
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: "#fecaca",
                            color: "#b91c1c",
                            minWidth: "80px",
                            textAlign: "center",
                          }}
                        >
                          {post.reportCount} {post.reportCount === 1 ? "report" : "reports"}
                        </div>
                      )}
                    </div>

                    <div className="post-actions">
                      <button
                        className="action-btn"
                        onClick={() => setSelectedPost(post)}
                        title="View post details"
                        style={{
                          backgroundColor: "#3b82f6",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#2563eb";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#3b82f6";
                        }}
                      >
                        View Post
                      </button>
                      
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleActionClick("keep", post.id, post.title)}
                        title="Keep post (dismiss reports)"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </button>

                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleActionClick("delete", post.id, post.title)}
                        title="Delete post"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn prev"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>

            <div className="pagination-numbers">{renderPaginationNumbers()}</div>

            <button
              className="pagination-btn next"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="modal-overlay" onClick={handleCancelAction}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon ${confirmationModal.type === "keep" ? "approve" : "reject"}`}>
              {confirmationModal.type === "keep" ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </div>

            <h2 className="modal-title">
              {confirmationModal.type === "keep" ? "Keep Post" : "Delete Post"}
            </h2>

            <p className="modal-message">
              {confirmationModal.type === "keep" ? (
                <>
                  Are you sure you want to keep the post "{confirmationModal.postTitle}" and dismiss all reports?
                  <br />
                  The post will remain visible to users.
                </>
              ) : (
                <>
                  Are you sure you want to delete the post "{confirmationModal.postTitle}"?
                  <br />
                  This will soft delete the post and it will no longer be visible.
                </>
              )}
            </p>

            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={handleCancelAction}>
                Cancel
              </button>
              <button
                className={`modal-btn primary ${confirmationModal.type === "delete" ? "reject" : ""}`}
                onClick={handleConfirmAction}
              >
                {confirmationModal.type === "keep" ? "Keep Post" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Dialog */}
      {selectedPost && (() => {
        // Extract image URLs from post
        const imageUrls = selectedPost.imagesWithData
          ?.filter(img => img.imageUrl !== null)
          .map(img => img.imageUrl!) || [];

        return (
          <PostDialog
            isOpen={true}
            onClose={() => setSelectedPost(null)}
            post={{
              postId: selectedPost.id,
              user: {
                name: selectedPost.userData?.userName || selectedPost.author,
                avatar: selectedPost.userData?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPost.author)}&background=random`,
              },
              timestamp: new Date(selectedPost.createdAt).toLocaleString(),
              content: {
                title: selectedPost.title,
                text: selectedPost.content,
                media: imageUrls.length > 0 ? imageUrls : undefined,
              },
              interactions: {
                comments: selectedPost.commentCount,
                retweets: 0,
                likes: selectedPost.reactionCount,
              },
              userVoteStatus: selectedPost.userVoteStatus,
            }}
          />
        );
      })()}
    </div>
  );
};

export default ReviewPostPage;
