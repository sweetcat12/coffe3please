function StarDisplay({ rating }) {
  const stars = [];
  const numRating = parseFloat(rating) || 0;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= numRating) {
      stars.push(<span key={i} className="star filled">★</span>);
    } else if (i - 0.5 <= numRating) {
      stars.push(<span key={i} className="star half">★</span>);
    } else {
      stars.push(<span key={i} className="star empty">☆</span>);
    }
  }
  
  return <div className="stars">{stars}</div>;
}

export default StarDisplay;