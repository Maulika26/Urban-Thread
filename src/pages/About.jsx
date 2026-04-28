import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Leaf, Zap, Target, Users, Award, Globe, TrendingUp } from 'lucide-react';
import './About.css';

export default function About() {
  const values = [
    {
      icon: Sparkles,
      title: 'Self-Expression',
      description: 'We believe fashion is more than fabric — it\'s a reflection of who you are. Every piece is crafted to let your personality shine through effortlessly.',
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'From ethically sourced materials to eco-conscious packaging, we\'re dedicated to creating fashion that respects both you and the planet.',
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'UrbanThread thrives on connection. Your voice shapes our collections, your stories inspire our designs, and your trust drives everything we do.',
    },
    {
      icon: Zap,
      title: 'Bold Innovation',
      description: 'Our mood-based shopping experience reimagines how you discover fashion. We blend technology with taste to make every visit personal.',
    },
    {
      icon: Target,
      title: 'Uncompromising Quality',
      description: 'Every stitch, every seam, every detail is intentional. We partner with skilled artisans and source premium fabrics to deliver pieces that endure.',
    },
    {
      icon: Globe,
      title: 'Inclusive Elegance',
      description: 'True style knows no boundaries. Our collections celebrate every silhouette, every story, and every individual — because elegance belongs to everyone.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Happy Customers' },
    { value: '200+', label: 'Curated Pieces' },
    { value: '15+', label: 'Cities Delivered' },
    { value: '4.9★', label: 'Average Rating' },
  ];

  const team = [
    {
      name: 'Arjun Mehta',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    },
    {
      name: 'Karthik Hema',
      role: 'Creative Head',
      image: 'https://openskools.com/Founder-transparent.png',
    },
    {
      name: 'Vani Krishna',
      role: 'Head of Design',
      image: '/vani-krishna.png',
    },
    {
      name: 'Ananya Patel',
      role: 'Marketing Lead',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80',
    },
  ];

  return (
    <div className="about-page page-enter">
      <div className="container">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero-badge animate-fade-in-up stagger-1">
            <Sparkles size={14} />
            <span>Our Story</span>
          </div>
          <h1 className="animate-fade-in-up stagger-2">
            Where Style Meets <span className="text-accent">Soul.</span>
          </h1>
          <p className="animate-fade-in-up stagger-3">
            UrbanThread was born from a desire to redefine modern fashion — clothing that 
            doesn't just look good, but feels right. We craft timeless pieces infused with 
            contemporary elegance, designed for those who believe style is deeply personal.
          </p>
        </section>

        {/* Our Story */}
        <section className="about-story">
          <div className="about-story-images animate-fade-in-up stagger-2">
            <div className="about-story-img">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"
                alt="UrbanThread atelier"
              />
            </div>
            <div className="about-story-img">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80"
                alt="Design process"
              />
            </div>
            <div className="about-story-img">
              <img
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80"
                alt="Fashion collection"
              />
            </div>
          </div>
          <div className="about-story-content animate-fade-in-up stagger-3">
            <h2>Born from Passion,<br />Refined by Purpose.</h2>
            <p>
              In 2024, a collective of designers and fashion enthusiasts in Bengaluru set out to 
              bridge a gap in Indian fashion — the space between <span className="highlight-text">everyday comfort</span> and 
              <span className="highlight-text"> effortless sophistication</span>. We believed that 
              looking polished shouldn't mean sacrificing authenticity.
            </p>
            <p>
              That vision became UrbanThread — a label that goes beyond asking "what size?" to 
              understanding <span className="highlight-text">"what's your mood?"</span> Our curated 
              collections are designed around how you feel, helping you find pieces that complement 
              your confidence, your calm, or your creative energy.
            </p>
            <p>
              Today, we proudly serve over 50,000 discerning customers across India with a 
              thoughtfully curated collection of 200+ pieces — each one crafted to make you 
              feel like the most refined version of yourself.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="about-stats animate-fade-in-up">
          {stats.map((stat, i) => (
            <div key={i} className="stat-item">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Values */}
        <section className="about-values">
          <div className="about-values-header">
            <h2>What Drives Us</h2>
            <p>Six principles that define every piece we create</p>
          </div>
          <div className="values-grid">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className={`value-card animate-fade-in-up stagger-${i + 1}`}>
                  <div className="value-icon">
                    <Icon size={28} />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team */}
        <section className="about-team">
          <div className="about-team-header">
            <h2>The Minds Behind the Thread</h2>
            <p>Passionate individuals crafting your experience</p>
          </div>
          <div className="team-grid">
            {team.map((member, i) => (
              <div key={i} className={`team-card animate-fade-in-up stagger-${i + 1}`}>
                <div className="team-card-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <h4>{member.name}</h4>
                <span className="team-role">{member.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta animate-fade-in-up">
          <h2>Discover Your Signature Style</h2>
          <p>Explore our curated collections and find pieces that resonate with your unique elegance.</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Explore Collection <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
}
