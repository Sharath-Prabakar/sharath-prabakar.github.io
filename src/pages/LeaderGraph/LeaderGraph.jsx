import React, { useState } from 'react';
import './leaderGraph.css';
import LeaderHeroSection from './LeaderHeroSection';
import CareerTimeline from './CareerTimeline';
import ElectionPerformanceChart from './ElectionPerformanceChart';
import NewsFeed from './NewsFeed';
import LeaderTabs from './LeaderTabs';
import PartyJourney from './PartyJourney';
import ElectionHistoryTable from './ElectionHistoryTable';
import ConstituencyInfo from './ConstituencyInfo';
import KeyInfo from './KeyInfo';
import SourcesWidget from './SourcesWidget';
import ProfileAssets from './ProfileAssets';

const LeaderGraph = () => {
    const [activeTab, setActiveTab] = useState('overview');

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

    const mockPartyJourney = [
        {
            party: "Indian Police Service",
            period: "2011 - 2019",
            role: "IPS Officer (Karnataka Cadre)",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Seal_of_the_Indian_Police_Service.svg/1200px-Seal_of_the_Indian_Police_Service.svg.png",
            color: "#607d8b"
        },
        {
            party: "Bharatiya Janata Party",
            period: "2020 - Present",
            role: "State President (Tamil Nadu)",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/512px-Bharatiya_Janata_Party_logo.svg.png",
            color: "#FF9933"
        }
    ];

    const mockElectionHistory = [
        {
            year: "2021",
            constituency: "Aravakurichi",
            party: "BJP",
            result: "Lost",
            margin: "24,816"
        },
        {
            year: "2024",
            constituency: "Coimbatore",
            party: "BJP",
            result: "Lost",
            margin: "1,18,068"
        }
    ];

    const mockConstituencyData = {
        state: "Tamil Nadu",
        district: "Coimbatore",
        type: "General",
        totalVoters: 1500000,
        lastTurnout: "71.2%"
    };

    const mockKeyInfoData = {
        assets: "₹3.5 Crores",
        liabilities: "₹1.2 Crores",
        criminalCases: "0",
        panStatus: "Available"
    };

    const mockProfileData = {
        fullName: "Kuppusamy Annamalai",
        dob: "June 4, 1984",
        placeOfBirth: "Karur, Tamil Nadu",
        education: "BE (PSG Tech), MBA (IIM Lucknow)",
        spouse: "Akshaya",
        children: "1",
        criminalCases: "0",
        panStatus: "Available",
        bio: "K. Annamalai is a former Indian Police Service (IPS) officer who served in the Karnataka cadre. Known for his upright and efficient administration, he earned the nickname 'Singham of Karnataka'. He resigned from the IPS in 2019 to enter public service through politics and joined the Bharatiya Janata Party (BJP). He currently serves as the State President of BJP Tamil Nadu."
    };

    const mockAssetData = {
        movableTotal: "₹1.58 Crores",
        movableDetails: [
            { name: "Cash", value: "₹50,000" },
            { name: "Bank Deposits", value: "₹12.4 Lakhs" },
            { name: "Investments", value: "₹45 Lakhs" },
            { name: "Jewellery", value: "₹1.01 Crores" }
        ],
        immovableTotal: "₹1.92 Crores",
        immovableDetails: [
            { name: "Agricultural Land", value: "₹1.12 Crores" },
            { name: "Residential Buildings", value: "₹80 Lakhs" }
        ],
        liabilitiesTotal: "₹1.2 Crores",
        liabilitiesDetails: [
            { name: "Bank Loans", value: "₹1.2 Crores" }
        ]
    };

    const mockSources = [
        { name: "Election Commission of India", date: "May 2024", credibility: "High", url: "https://results.eci.gov.in" },
        { name: "MyNeta (ADR)", date: "April 2024", credibility: "High", url: "https://myneta.info" },
        { name: "The Hindu - News Archive", date: "2021-2024", credibility: "High", url: "https://thehindu.com" },
        { name: "Local News Reports", date: "March 2024", credibility: "Medium", url: "" }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="leader-graph-grid">
                        <div className="left-col">
                            <ElectionHistoryTable historyData={mockElectionHistory} />
                            <CareerTimeline timelineData={mockTimelineData} />
                        </div>

                        <div className="right-col">
                            <ConstituencyInfo data={mockConstituencyData} />
                            <KeyInfo data={mockKeyInfoData} />

                            <section className="graph-section">
                                <h2 className="section-title">🚩 Party Journey</h2>
                                <PartyJourney journeyData={mockPartyJourney} />
                            </section>

                            <section className="graph-section">
                                <h2 className="section-title">📈 Election Performance</h2>
                                <ElectionPerformanceChart chartData={mockChartData} />
                            </section>
                            
                            <section className="graph-section">
                                <h2 className="section-title">📰 Latest News</h2>
                                <NewsFeed />
                            </section>

                            <SourcesWidget sources={mockSources} />
                        </div>
                    </div>
                );
            case 'timeline':
                return (
                    <div className="single-col-content">
                        <CareerTimeline timelineData={mockTimelineData} />
                    </div>
                );
            case 'elections':
                return (
                    <div className="single-col-content">
                        <ElectionHistoryTable historyData={mockElectionHistory} />
                        <section className="graph-section">
                            <h2 className="section-title">📈 Election Performance</h2>
                            <ElectionPerformanceChart chartData={mockChartData} />
                        </section>
                    </div>
                );
            case 'news':
                return (
                    <div className="single-col-content">
                        <section className="graph-section">
                            <h2 className="section-title">📰 Latest News</h2>
                            <NewsFeed />
                        </section>
                    </div>
                );
            case 'party':
                return (
                    <div className="single-col-content">
                        <section className="graph-section">
                            <h2 className="section-title">🚩 Party Journey & History</h2>
                            <PartyJourney journeyData={mockPartyJourney} />
                        </section>
                    </div>
                );
            case 'profile':
                return (
                    <div className="single-col-content">
                        <ProfileAssets profileData={mockProfileData} assetData={mockAssetData} />
                        <div style={{ marginTop: '2rem' }}>
                            <SourcesWidget sources={mockSources} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="leader-graph-container">
            <LeaderHeroSection leaderData={mockLeaderData} />
            
            <LeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="tab-content-area">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default LeaderGraph;
