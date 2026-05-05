import React from 'react';
import './LeaderHeroSection.css';

const LeaderHeroSection = ({ leaderData }) => {
  if (!leaderData) return null;

  const {
    name,
    photo,
    partyLogo,
    age,
    education,
    profession,
    electionResult
  } = leaderData;

  return (
    <div className="leader-hero-card">
      <div className="leader-profile-column">
        <div className="leader-photo-container">
          <img src={photo} alt={name} className="leader-photo" />
          <div className="party-logo-container">
            <img src={partyLogo} alt="Party Logo" className="party-logo" />
          </div>
        </div>
        <div className="leader-info">
          <h2 className="leader-name">{name}</h2>
          <div className="leader-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Age</span>
              <span className="metadata-value">{age}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Education</span>
              <span className="metadata-value">{education}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Profession</span>
              <span className="metadata-value">{profession}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="election-widget-column">
        <h3 className="widget-title">2026 Election Result</h3>
        <div className="election-result-widget">
          <div className="result-card">
            <span className="result-label">Status</span>
            <span className={`result-value status-${electionResult.status.toLowerCase()}`}>
              {electionResult.status}
            </span>
          </div>
          <div className="result-card">
            <span className="result-label">Votes</span>
            <span className="result-value">{electionResult.votes.toLocaleString()}</span>
          </div>
          <div className="result-card">
            <span className="result-label">Margin</span>
            <span className="result-value">{electionResult.margin.toLocaleString()}</span>
          </div>
          <div className="result-card">
            <span className="result-label">Constituency</span>
            <span className="result-value">{electionResult.constituency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderHeroSection;
