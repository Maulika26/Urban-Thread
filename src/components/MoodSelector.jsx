import { useState } from 'react';
import { Flame, Coffee, Zap } from 'lucide-react';
import './MoodSelector.css';

const moods = [
  {
    id: 'Confident',
    label: 'Confident',
    icon: Flame,
    color: 'var(--mood-confident)',
    description: 'Bold & powerful looks',
    emoji: '🔥'
  },
  {
    id: 'Relaxed',
    label: 'Relaxed',
    icon: Coffee,
    color: 'var(--mood-relaxed)',
    description: 'Chill & comfy vibes',
    emoji: '☕'
  },
  {
    id: 'Energetic',
    label: 'Energetic',
    icon: Zap,
    color: 'var(--mood-energetic)',
    description: 'Active & sporty energy',
    emoji: '⚡'
  }
];

export default function MoodSelector({ selectedMood, onMoodSelect }) {
  return (
    <div className="mood-selector">
      <div className="mood-cards">
        {moods.map(mood => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              className={`mood-card ${isSelected ? 'mood-card-active' : ''}`}
              onClick={() => onMoodSelect(isSelected ? null : mood.id)}
              style={{ '--mood-color': mood.color }}
            >
              <div className="mood-card-icon">
                <Icon size={28} />
              </div>
              <span className="mood-card-emoji">{mood.emoji}</span>
              <h3 className="mood-card-label">{mood.label}</h3>
              <p className="mood-card-desc">{mood.description}</p>
              {isSelected && <div className="mood-card-check">✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
