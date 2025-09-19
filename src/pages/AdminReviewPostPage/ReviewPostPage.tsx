import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import './ReviewPostPage.css';
import GameFooter from '../../components/layout/GameFooter';

interface Post {
  id: number;
  title: string;
  author: string;
  category: 'health' | 'exercise' | 'advise';
  status: 'pending' | 'approved' | 'rejected';
}

interface ConfirmationModal {
  isOpen: boolean;
  type: 'approve' | 'reject' | null;
  postId: number | null;
  postTitle: string;
}

const ReviewPostPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const [posts, setPosts] = useState<Post[]>([
    { id: 1, title: 'Is Skipping Breakfast Really That Bad?', author: 'Rosie Pearson', category: 'health', status: 'pending' },
    { id: 2, title: '30-Day Plank Challenge – Worth It?', author: 'Darrell Caldwell', category: 'exercise', status: 'pending' },
    { id: 3, title: 'Gym vs. Cardio: What Works Better?', author: 'Gilbert Johnston', category: 'exercise', status: 'pending' },
    { id: 4, title: '5 Fitness Mistakes Beginners Make', author: 'Alan Cain', category: 'advise', status: 'pending' },
    { id: 5, title: 'How Sleep Affects Your Workout Results', author: 'Alfred Murray', category: 'health', status: 'pending' },
    { id: 6, title: 'How I Stayed Motivated for 60 Days', author: 'Maggie Sullivan', category: 'advise', status: 'pending' },
    { id: 7, title: 'Home Workout, Real Gains?', author: 'Rosie Todd', category: 'exercise', status: 'pending' }
  ]);

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    isOpen: false,
    type: null,
    postId: null,
    postTitle: ''
  });

  const pendingPosts = posts.filter(post => post.status === 'pending');
  const postsPerPage = 10;
  const totalPages = Math.ceil(pendingPosts.length / postsPerPage);

  const handleActionClick = (action: 'approve' | 'reject', postId: number, postTitle: string) => {
    setConfirmationModal({
      isOpen: true,
      type: action,
      postId: postId,
      postTitle: postTitle
    });
  };

  const handleConfirmAction = () => {
    if (confirmationModal.postId && confirmationModal.type) {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === confirmationModal.postId
            ? { ...post, status: confirmationModal.type === 'approve' ? 'approved' : 'rejected' }
            : post
        )
      );
    }
    setConfirmationModal({ isOpen: false, type: null, postId: null, postTitle: '' });
  };

  const handleCancelAction = () => {
    setConfirmationModal({ isOpen: false, type: null, postId: null, postTitle: '' });
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'health': return 'category-health';
      case 'exercise': return 'category-exercise';
      case 'advise': return 'category-advise';
      default: return 'category-health';
    }
  };

  const renderPaginationNumbers = () => {
    const numbers = [];
    const maxVisible = 4;
    
    for (let i = 1; i <= Math.min(maxVisible, totalPages); i++) {
      numbers.push(
        <button
          key={i}
          className={`pagination-number ${currentPage === i ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    if (totalPages > maxVisible) {
      numbers.push(<span key="dots" className="pagination-dots">...</span>);
    }
    
    return numbers;
  };

  return (
    <div className="review-post-page">
      <Navbar currentPage="review-posts" />
      
      <div className="review-post-content">
        {/* Hero Section */}
        <div className="review-post-hero">
          <h1 className="review-post-title">Review posts</h1>
        </div>

        {/* Posts Grid */}
        <div className="review-posts-grid">
          {pendingPosts.map((post) => (
            <div key={post.id} className="review-post-card">
              <div className="post-info">
                <h3 className="post-title">{post.title}</h3>
                <div className={`post-category ${getCategoryClass(post.category)}`}>
                  {post.category}
                </div>
                <div className="post-author">{post.author}</div>
              </div>
              
              <div className="post-actions">
                <button 
                  className="action-btn approve-btn"
                  onClick={() => handleActionClick('approve', post.id, post.title)}
                  title="Approve post"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                
                <button 
                  className="action-btn reject-btn"
                  onClick={() => handleActionClick('reject', post.id, post.title)}
                  title="Reject post"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn prev" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="15,18 9,12 15,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            
            <div className="pagination-numbers">
              {renderPaginationNumbers()}
            </div>
            
            <button 
              className="pagination-btn next"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmationModal.isOpen && (
        <div className="modal-overlay" onClick={handleCancelAction}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon ${confirmationModal.type}`}>
              {confirmationModal.type === 'approve' ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
            
            <h2 className="modal-title">
              {confirmationModal.type === 'approve' ? 'Approve Post' : 'Reject Post'}
            </h2>
            
            <p className="modal-message">
              Are you sure you want to {confirmationModal.type} the post "{confirmationModal.postTitle}"?
              <br />
              This action cannot be undone.
            </p>
            
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={handleCancelAction}>
                Cancel
              </button>
              <button 
                className={`modal-btn primary ${confirmationModal.type === 'reject' ? 'reject' : ''}`}
                onClick={handleConfirmAction}
              >
                {confirmationModal.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <GameFooter />
    </div>
  );
};

export default ReviewPostPage;
