import React, { useState, useEffect, useRef, useCallback } from "react";
import BlogPost from "../../components/blogs/BlogPost";
import PostDialog from "../../components/blogs/PostDialog";
import FAB from "../../components/blogs/FAB";
import BlogHeader from "../../components/blogs/BlogHeader";
import GameFooter from "@/components/layout/GameFooter";
import { socialService } from "../../services/socialService";
import { authService } from "../../services/authService";
import type { Post } from "../../models/social";
import type { UserModel } from "../../models";
import { resolveApiAssetUrl } from "@/utils/media";

const Blogs: React.FC = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const postsPerLoad = 3;
  const currentIndexRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch all posts from the API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPosts = await socialService.getPosts();
        
        // Fetch images metadata, full data, and user vote status for each post
        const postsWithImages = await Promise.all(
          fetchedPosts.map(async (post) => {
            try {
              const imagesMeta = await socialService.getPostImages(post.id);
              
              // Fetch full image data for feed display
              const imagesWithData = await Promise.all(
                imagesMeta.map(async (imgMeta) => {
                  try {
                    const imgDetail = await socialService.getPostImageById(imgMeta.id);
                    return {
                      ...imgMeta,
                      imageUrl: imgDetail?.imageData 
                        ? `data:${imgMeta.contentType || 'image/jpeg'};base64,${imgDetail.imageData}`
                        : null
                    };
                  } catch (err) {
                    console.error(`Failed to load image ${imgMeta.id}:`, err);
                    return { ...imgMeta, imageUrl: null };
                  }
                })
              );

              // Fetch user's vote status for this post
              let userVoteStatus = { hasVoted: false, voteType: null as string | null };
              try {
                userVoteStatus = await socialService.getUserVote(post.id);
              } catch (err) {
                console.error(`Failed to fetch vote status for post ${post.id}:`, err);
              }

              // Fetch user data for this post
              let userData = undefined;
              try {
                const user = await authService.getUser(post.userId);
                userData = {
                  userName: user.userName,
                  fullName: user.fullName || null,
                  profilePicture: user.profilePicture || null,
                };
              } catch (err) {
                console.error(`Failed to fetch user data for user ${post.userId}:`, err);
              }
              
              return { ...post, images: imagesMeta, imagesWithData, userVoteStatus, userData };
            } catch (err) {
              console.error(`Failed to fetch images for post ${post.id}:`, err);
              return { ...post, images: [], imagesWithData: [], userVoteStatus: { hasVoted: false, voteType: null } };
            }
          })
        );
        
        // Sort posts by createdAt (newest first)
        const sortedPosts = postsWithImages.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setAllPosts(sortedPosts);
        
        // Load first batch of posts
        const initialPosts = sortedPosts.slice(0, postsPerLoad);
        setDisplayedPosts(initialPosts);
        currentIndexRef.current = postsPerLoad;
        setHasMore(postsWithImages.length > postsPerLoad);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Load more posts
  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      const nextIndex = currentIndexRef.current + postsPerLoad;
      const newPosts = allPosts.slice(currentIndexRef.current, nextIndex);
      
      setDisplayedPosts(prev => [...prev, ...newPosts]);
      currentIndexRef.current = nextIndex;
      setHasMore(nextIndex < allPosts.length);
      setLoadingMore(false);
    }, 300);
  }, [allPosts, hasMore, loadingMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && !loadingMore && hasMore) {
        loadMorePosts();
      }
    }, options);

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMorePosts, loadingMore, hasMore]);

  const handlePostClick = async (post: Post) => {
    // Fetch full image data for the post (with base64 data)
    let imageUrls: string[] = [];
    if (post.images && post.images.length > 0) {
      try {
        const imagePromises = post.images.map(async (img) => {
          try {
            const imageDetail = await socialService.getPostImageById(img.id);
            // The imageData comes as base64 string from the backend
            if (imageDetail && imageDetail.imageData) {
              // If it's already a data URL, return it
              if (typeof imageDetail.imageData === 'string' && imageDetail.imageData.startsWith('data:')) {
                return imageDetail.imageData;
              }
              // Otherwise, construct the data URL
              return `data:${img.contentType || 'image/jpeg'};base64,${imageDetail.imageData}`;
            }
            return null;
          } catch (imgErr) {
            console.error(`Failed to load image ${img.id}:`, imgErr);
            return null;
          }
        });
        const results = await Promise.all(imagePromises);
        imageUrls = results.filter((url): url is string => url !== null);
      } catch (err) {
        console.error("Failed to fetch image data:", err);
      }
    }

    // Transform the API Post to the format PostDialog expects
    const displayName = post.userData?.userName || `User ${post.userId.substring(0, 8)}`;
    const resolvedAvatar = resolveApiAssetUrl(post.userData?.profilePicture);
    const avatarUrl =
      resolvedAvatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

    const transformedPost = {
      user: {
        name: displayName,
        avatar: avatarUrl,
      },
      timestamp: new Date(post.createdAt).toLocaleString(),
      content: {
        title: post.title !== post.content ? post.title : undefined,
        text: post.content,
        media: imageUrls.length > 0 ? imageUrls : undefined,
      },
      interactions: {
        likes: post.reactionCount,
        comments: 0,
        retweets: 0,
      },
      postId: post.id, // Pass the post ID for fetching comments and likes
    };
    setSelectedPost(transformedPost);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPost(null);
  };

  const handlePostUpdated = (postId: string, updates: { likes?: number; comments?: number; isLiked?: boolean }) => {
    // Update the post in allPosts
    setAllPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            reactionCount: updates.likes !== undefined ? updates.likes : post.reactionCount,
            commentCount: updates.comments !== undefined ? updates.comments : post.commentCount,
            userVoteStatus: updates.isLiked !== undefined 
              ? { hasVoted: updates.isLiked, voteType: updates.isLiked ? "reaction" : null }
              : post.userVoteStatus,
          };
        }
        return post;
      })
    );

    // Update the post in displayedPosts
    setDisplayedPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            reactionCount: updates.likes !== undefined ? updates.likes : post.reactionCount,
            commentCount: updates.comments !== undefined ? updates.comments : post.commentCount,
            userVoteStatus: updates.isLiked !== undefined 
              ? { hasVoted: updates.isLiked, voteType: updates.isLiked ? "reaction" : null }
              : post.userVoteStatus,
          };
        }
        return post;
      })
    );

    // Update selectedPost if it's the same post
    if (selectedPost && selectedPost.postId === postId) {
      setSelectedPost((prev: any) => ({
        ...prev,
        interactions: {
          ...prev.interactions,
          likes: updates.likes !== undefined ? updates.likes : prev.interactions.likes,
          comments: updates.comments !== undefined ? updates.comments : prev.interactions.comments,
        },
      }));
    }
  };

  const handlePostCreated = async () => {
    // Refresh posts after creating a new one
    try {
      const fetchedPosts = await socialService.getPosts();
      
      // Fetch images metadata, full data, and user vote status for each post
      const postsWithImages = await Promise.all(
        fetchedPosts.map(async (post) => {
          try {
            const imagesMeta = await socialService.getPostImages(post.id);
            
            // Fetch full image data for feed display
            const imagesWithData = await Promise.all(
              imagesMeta.map(async (imgMeta) => {
                try {
                  const imgDetail = await socialService.getPostImageById(imgMeta.id);
                  return {
                    ...imgMeta,
                    imageUrl: imgDetail?.imageData 
                      ? `data:${imgMeta.contentType || 'image/jpeg'};base64,${imgDetail.imageData}`
                      : null
                  };
                } catch (err) {
                  console.error(`Failed to load image ${imgMeta.id}:`, err);
                  return { ...imgMeta, imageUrl: null };
                }
              })
            );

            // Fetch user's vote status for this post
            let userVoteStatus = { hasVoted: false, voteType: null as string | null };
            try {
              userVoteStatus = await socialService.getUserVote(post.id);
            } catch (err) {
              console.error(`Failed to fetch vote status for post ${post.id}:`, err);
            }

            // Fetch user data for this post
            let userData = undefined;
            try {
              const user = await authService.getUser(post.userId);
              userData = {
                userName: user.userName,
                fullName: user.fullName || null,
                profilePicture: user.profilePicture || null,
              };
            } catch (err) {
              console.error(`Failed to fetch user data for user ${post.userId}:`, err);
            }
            
            return { ...post, images: imagesMeta, imagesWithData, userVoteStatus, userData };
          } catch (err) {
            console.error(`Failed to fetch images for post ${post.id}:`, err);
            return { ...post, images: [], imagesWithData: [], userVoteStatus: { hasVoted: false, voteType: null } };
          }
        })
      );
      
      // Sort posts by createdAt (newest first)
      const sortedPosts = postsWithImages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setAllPosts(sortedPosts);
      
      // Reset displayed posts to show from the beginning with new post
      const initialPosts = sortedPosts.slice(0, postsPerLoad);
      setDisplayedPosts(initialPosts);
      currentIndexRef.current = postsPerLoad;
      setHasMore(postsWithImages.length > postsPerLoad);
      
      // Scroll to top to see the new post
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error refreshing posts:", err);
    }
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #5BC17F 17%, rgba(255, 123, 23, 0.3) 54%, #007E85 91%)",
          margin: 0,
          padding: "80px 0 0", // Add top padding for fixed navbar
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Blog Header */}
        <BlogHeader />

        <div
          style={{
            width: "65%",
            maxWidth: "800px",
            padding: "0 20px",
            boxSizing: "border-box",
            flex: 1,
            minHeight: "400px",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#fff" }}>
              <p style={{ fontSize: "18px" }}>Loading posts...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#ff6b6b" }}>
              <p style={{ fontSize: "18px" }}>{error}</p>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#fff" }}>
              <p style={{ fontSize: "18px" }}>No posts available yet. Be the first to create one!</p>
            </div>
          ) : (
            <>
              {displayedPosts.map((post) => {
                // Get image URLs from loaded data
                const imageUrls = post.imagesWithData
                  ?.filter(img => img.imageUrl !== null)
                  .map(img => img.imageUrl!) || [];

                const displayName = post.userData?.userName || `User ${post.userId.substring(0, 8)}`;
                const resolvedAvatar = resolveApiAssetUrl(post.userData?.profilePicture);
                const avatarUrl =
                  resolvedAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

                return (
                  <BlogPost
                    key={post.id}
                    user={{
                      name: displayName,
                      avatar: avatarUrl,
                    }}
                    timestamp={new Date(post.createdAt).toLocaleString()}
                    content={{
                      title: post.title !== post.content ? post.title : undefined,
                      text: post.content,
                      media: imageUrls.length > 0 ? imageUrls : undefined,
                    }}
                    interactions={{
                      likes: post.reactionCount,
                      comments: post.commentCount,
                      retweets: 0,
                    }}
                    postId={post.id}
                    initialLiked={post.userVoteStatus?.hasVoted && post.userVoteStatus?.voteType === "reaction"}
                    onClick={() => handlePostClick(post)}
                    onLikeChange={(postId, isLiked, newCount) => {
                      handlePostUpdated(postId, { likes: newCount, isLiked });
                    }}
                  />
                );
              })}
              
              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} style={{ height: "20px", margin: "20px 0" }} />
              
              {/* Loading more indicator */}
              {loadingMore && (
                <div style={{ textAlign: "center", padding: "20px", color: "#fff" }}>
                  <p style={{ fontSize: "16px" }}>Loading more posts...</p>
                </div>
              )}
              
              {/* End of posts indicator */}
              {!hasMore && displayedPosts.length > 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#fff", opacity: 0.7 }}>
                  <p style={{ fontSize: "16px" }}>You've reached the end! 🎉</p>
                  <p style={{ fontSize: "14px", marginTop: "8px" }}>
                    Showing all {displayedPosts.length} post{displayedPosts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Post Dialog */}
        {selectedPost && (
          <PostDialog 
            post={selectedPost} 
            isOpen={isDialogOpen} 
            onClose={handleCloseDialog}
            onPostUpdated={handlePostUpdated}
          />
        )}

        {/* Floating Action Button */}
        <FAB onPostCreated={handlePostCreated} />

        {/* Footer */}
        <div style={{ width: "100%" }}>
          <GameFooter />
        </div>
      </div>
    </>
  );
};

export default Blogs;
