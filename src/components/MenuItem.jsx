import StarDisplay from './StarDisplay';

function MenuItem({ item, category, openRatingModal, averageRating, reviewCount }) {
  return (
    <div className="menu-item">
      <div className="item-info">
        <h4>{item.name}</h4>
        <p>{item.description}</p>
        <div className="rating-display">
          <StarDisplay rating={averageRating} />
          <span className="review-count">
            {reviewCount > 0 ? `${averageRating} (${reviewCount} reviews)` : 'No reviews yet'}
          </span>
        </div>
      </div>
      <button 
        className="rate-btn"
        onClick={() => openRatingModal(item, category)}
      >
        Rate & Review
      </button>
    </div>
  );
}

export default MenuItem;