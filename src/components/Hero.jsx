function Hero({ currentUser }) {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <h1>
          {currentUser ? `Welcome back, ${currentUser.name}!` : 'Welcome to CoffeePlease'}
        </h1>
        <p>Rate Your Favorite Coffee & Share Your Experience</p>
        <a href="#menu" className="cta-button">Explore Menu</a>
      </div>
    </section>
  );
}

export default Hero;