import MenuItem from './MenuItem';

function Menu({ menuItems, openRatingModal, ratings, getAverageRating }) {
  return (
    <section id="menu" className="menu">
      <div className="container">
        <h2>Our Menu</h2>
        <div className="menu-categories">
          {Object.entries(menuItems).map(([category, items]) => (
            <div key={category} className="menu-category">
              <h3>{category}</h3>
              {items.map(item => (
                <MenuItem 
                  key={item.id}
                  item={item}
                  category={category}
                  openRatingModal={openRatingModal}
                  averageRating={getAverageRating(item.id)}
                  reviewCount={ratings[item.id]?.length || 0}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Menu;