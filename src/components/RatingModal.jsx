import { useState } from 'react';
import StarDisplay from './StarDisplay';
import { Upload, X } from 'lucide-react';

function RatingModal({ product, closeModal, submitRating, existingRatings, currentUser }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
      setImageError('Only JPG images are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be less than 5MB');
      return;
    }

    setImageError('');

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0) {
      submitRating(rating, comment, image); // Pass image to submitRating
      setRating(0);
      setComment('');
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Rate {product.name}</h2>
          <button className="close-btn" onClick={closeModal}>&times;</button>
        </div>
        
        <div className="rating-form">
          <div className="current-user-info">
            <p>Reviewing as: <strong>{currentUser.name}</strong></p>
          </div>

          <div className="form-group">
            <label>Your Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star-input ${star <= (hoveredRating || rating) ? 'filled' : 'empty'}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="rating-text">
              {rating === 0 && 'Select a rating'}
              {rating === 1 && '⭐ Poor'}
              {rating === 2 && '⭐⭐ Fair'}
              {rating === 3 && '⭐⭐⭐ Good'}
              {rating === 4 && '⭐⭐⭐⭐ Very Good'}
              {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Review (Optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              placeholder="Share your thoughts about this drink..."
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label>Add a Photo (Optional)</label>
            <div className="image-upload-section">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label htmlFor="image-upload" className="image-upload-label">
                  <div className="upload-placeholder">
                    <Upload size={32} />
                    <p>Upload an image</p>
                    <span className="upload-hint">JPG only, max 5MB</span>
                  </div>
                </label>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/jpg"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              {imageError && <div className="image-error">{imageError}</div>}
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            className="submit-btn"
            disabled={rating === 0}
          >
            Submit Review
          </button>
        </div>

        {existingRatings.length > 0 && (
          <div className="existing-reviews">
            <h3>Customer Reviews ({existingRatings.length})</h3>
            <div className="reviews-list">
              {existingRatings.slice(-5).reverse().map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <strong>{review.customerName || review.username}</strong>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <StarDisplay rating={review.rating} />
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                  {review.image && (
                    <div className="review-image-wrapper">
                      <img 
                        src={review.image} 
                        alt="Review" 
                        className="review-thumbnail"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RatingModal;