import React from 'react';
import './SourcesWidget.css';

const SourcesWidget = ({ sources }) => {
    return (
        <section className="graph-section sources-widget">
            <h2 className="section-title">
                <span className="title-icon">🔍</span> Sources & Transparency
            </h2>
            <div className="sources-list">
                {sources.map((source, index) => (
                    <div key={index} className="source-item">
                        <div className="source-main">
                            <div className="source-info">
                                <span className="source-name">{source.name}</span>
                                <span className="source-date">{source.date}</span>
                            </div>
                            <div className={`credibility-tag ${source.credibility.toLowerCase()}`}>
                                <span className="tag-dot"></span>
                                {source.credibility} Credibility
                            </div>
                        </div>
                        {source.url && (
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                                View Source ↗
                            </a>
                        )}
                    </div>
                ))}
            </div>
            <div className="transparency-footer">
                <p className="transparency-note">
                    * Data is aggregated from public records and verified news outlets.
                </p>
                <button className="report-issue-btn">Report Data Issue</button>
            </div>
        </section>
    );
};

export default SourcesWidget;
