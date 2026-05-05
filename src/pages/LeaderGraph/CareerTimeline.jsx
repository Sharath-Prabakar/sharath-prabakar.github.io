import React from 'react';
import './CareerTimeline.css';

const CareerTimeline = ({ timelineData }) => {
  return (
    <div className="career-timeline-container">
      <h2 className="timeline-title">Career Journey</h2>
      <div className="timeline-wrapper">
        {timelineData.map((item, index) => (
          <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
            <div className="timeline-content">
              <div className="timeline-date">{item.year}</div>
              <div className="timeline-card">
                <div className={`node-indicator ${item.type === 'Won' ? 'node-won' : 'node-joined'}`}></div>
                <h3 className="event-title">{item.title}</h3>
                <p className="event-description">{item.description}</p>
                <span className={`event-tag ${item.type === 'Won' ? 'tag-won' : 'tag-joined'}`}>
                  {item.type}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div className="timeline-line"></div>
      </div>
    </div>
  );
};

export default CareerTimeline;
