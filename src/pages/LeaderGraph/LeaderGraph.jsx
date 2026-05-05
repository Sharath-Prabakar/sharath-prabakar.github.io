import React from 'react';
import './leaderGraph.css';
import LeaderHeroSection from './LeaderHeroSection';
import CareerTimeline from './CareerTimeline';
import ElectionPerformanceChart from './ElectionPerformanceChart';
import NewsFeed from './NewsFeed';

const LeaderGraph = () => {
    // ... (keep existing mock data)
    const mockLeaderData = {
        name: "K. Annamalai",
        photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/K._Annamalai_IPS.jpg/440px-K._Annamalai_IPS.jpg",
        partyLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/512px-Bharatiya_Janata_Party_logo.svg.png",
        age: 39,
        education: "MBA, IIM Lucknow",
        profession: "Former IPS Officer",
        electionResult: {
            status: "Won",
            votes: 450000,
            margin: 25000,
            constituency: "Coimbatore"
        }
    };

    const mockTimelineData = [
        {
            year: "2011",
            title: "Joined Indian Police Service",
            description: "Allocated to Karnataka Cadre. Served as ASP of Karkala.",
            type: "Joined"
        },
        {
            year: "2015",
            title: "SP of Udupi District",
            description: "Known as the 'Singham' of Karnataka for his tough stance on crime.",
            type: "Won"
        },
        {
            year: "2019",
            title: "Resigned from IPS",
            description: "Decided to enter public service through politics.",
            type: "Joined"
        },
        {
            year: "2020",
            title: "Joined Bharatiya Janata Party",
            description: "Officially entered politics in the presence of national leaders.",
            type: "Joined"
        },
        {
            year: "2021",
            title: "State President, BJP Tamil Nadu",
            description: "Appointed as the youngest State President of BJP TN.",
            type: "Won"
        },
        {
            year: "2024",
            title: "Coimbatore Lok Sabha Candidate",
            description: "Contested in the 2024 General Elections with a massive campaign.",
            type: "Won"
        }
    ];

    const mockChartData = [
        { year: '2019', votes: 0, margin: 0 },
        { year: '2021', votes: 350000, margin: 15000 },
        { year: '2024', votes: 450000, margin: 25000 }
    ];

    return (
        <div className="leader-graph-container">
            <LeaderHeroSection leaderData={mockLeaderData} />
            
            <div className="leader-graph-grid">
                <div className="left-col">
                    <section className="graph-section">
                        <h2 className="section-title">📈 Election Performance</h2>
                        <ElectionPerformanceChart chartData={mockChartData} />
                    </section>
                    
                    <section className="graph-section">
                        <h2 className="section-title">📰 Latest News</h2>
                        <NewsFeed />
                    </section>
                </div>

                <div className="right-col">
                    <CareerTimeline timelineData={mockTimelineData} />
                </div>
            </div>
        </div>
    );
};

export default LeaderGraph;
