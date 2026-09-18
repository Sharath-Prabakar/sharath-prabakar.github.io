import React, { useState, useEffect } from 'react';
import { fplService } from '../../../services/fplService';

const POSITION_NAMES = { 1: 'GKP', 2: 'DEF', 3: 'MID', 4: 'FWD' };

const PressNewsDigest = ({ selectedAnalysis, bootstrapData }) => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'SQUAD', 'INJURIES'

  // Fetch initial news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await fplService.getNews();
        if (data && Array.isArray(data)) {
          setNewsList(data);
        }
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const freshData = await fplService.refreshNews();
      if (freshData && Array.isArray(freshData)) {
        setNewsList(freshData);
      }
    } catch (err) {
      console.error('Failed to refresh news:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Extract squad clubs and flagged players from bootstrap data
  const squad = selectedAnalysis?.squad || [];
  const squadClubs = [...new Set(squad.map(p => p.team).filter(Boolean))];

  const flaggedSquadPlayers = squad.map(p => {
    const bPlayer = bootstrapData?.elements?.find(e => e.id === p.id);
    if (!bPlayer) return null;

    const isFlagged = bPlayer.status !== 'a' ||
      (bPlayer.chance_of_playing_next_round !== null && bPlayer.chance_of_playing_next_round < 100) ||
      (bPlayer.news && bPlayer.news.trim().length > 0);

    if (!isFlagged) return null;

    return {
      ...p,
      status: bPlayer.status,
      news: bPlayer.news,
      news_added: bPlayer.news_added,
      chance: bPlayer.chance_of_playing_next_round
    };
  }).filter(Boolean);

  // Filter news articles based on search & filter category
  const filteredNews = newsList.filter(item => {
    const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();

    // Category filter
    if (selectedFilter === 'SQUAD') {
      const mentionsSquad = squadClubs.some(club => text.includes(club.toLowerCase())) ||
        squad.some(p => text.includes(p.name.toLowerCase()));
      if (!mentionsSquad) return false;
    } else if (selectedFilter === 'INJURIES') {
      const hasInjuryWord = /injury|doubt|fitness|ruled out|hamstring|knee|ankle|training|press conference|knock/i.test(text);
      if (!hasInjuryWord) return false;
    }

    // Text search
    if (searchTerm) {
      return text.includes(searchTerm.toLowerCase());
    }

    return true;
  });

  return (
    <div className="fpl-card" style={{ border: '1px solid #6366f1', borderRadius: '12px', background: '#0b0c16', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #1e2040', paddingBottom: '15px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>📰</span>
            <h2 style={{ margin: 0, color: '#818cf8', fontSize: '1.35rem' }}>
              Press Conference Digest & Team News Feed
            </h2>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#a5b4fc', fontSize: '0.86rem' }}>
            Live Premier League manager press conference reports, team news, and official squad medical updates.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            background: refreshing ? '#312e81' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            border: 'none',
            color: '#fff',
            padding: '7px 16px',
            borderRadius: '6px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: '0.82rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <span>{refreshing ? '⏳' : '🔄'}</span>
          {refreshing ? 'Fetching Live Feeds...' : 'Refresh News Feed'}
        </button>
      </div>

      {/* Part 1: Official Squad Injury & Status Flags */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <h3 style={{ color: '#d4af37', fontSize: '0.98rem', margin: 0 }}>
            🏥 Squad Medical & Fitness Monitor ({flaggedSquadPlayers.length} Flagged)
          </h3>
        </div>

        {flaggedSquadPlayers.length === 0 ? (
          <div style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#4ade80',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>✅</span>
            <span>All 15 squad players are marked 100% available with no official injury flags.</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px'
          }}>
            {flaggedSquadPlayers.map(p => {
              const isOut = p.status === 'i' || p.status === 'u' || p.chance === 0;
              const isDoubt = p.status === 'd' || (p.chance !== null && p.chance > 0 && p.chance < 100);

              let badgeColor = '#ef4444';
              let badgeText = '0% - Out';

              if (p.chance !== null && p.chance !== undefined) {
                badgeText = `${p.chance}% Chance`;
                badgeColor = p.chance >= 75 ? '#eab308' : p.chance >= 50 ? '#f97316' : '#ef4444';
              } else if (p.status === 'u') {
                badgeText = 'Unavailable / Loan';
                badgeColor = '#64748b';
              } else if (isDoubt) {
                badgeText = 'Doubtful';
                badgeColor = '#eab308';
              }

              return (
                <div
                  key={p.id}
                  style={{
                    background: '#121422',
                    border: `1px solid ${isOut ? '#7f1d1d' : '#713f12'}`,
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff' }}>{p.name}</span>
                      <span style={{ color: '#888', fontSize: '0.75rem' }}>({p.team})</span>
                    </div>
                    <span style={{
                      background: badgeColor,
                      color: '#000',
                      fontSize: '0.68rem',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {badgeText}
                    </span>
                  </div>

                  <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: '1.4', marginTop: '4px' }}>
                    {p.news || 'Flagged in official Premier League injury report.'}
                  </div>

                  {p.news_added && (
                    <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '6px' }}>
                      Reported: {new Date(p.news_added).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Part 2: Premier League Press Conference & News Feed */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <h3 style={{ color: '#818cf8', fontSize: '0.98rem', margin: 0 }}>
            🎙️ Manager Press Briefings & News Articles ({filteredNews.length})
          </h3>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setSelectedFilter('ALL')}
              style={{
                background: selectedFilter === 'ALL' ? '#4f46e5' : '#1e1b4b',
                border: '1px solid #4338ca',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                fontWeight: selectedFilter === 'ALL' ? 'bold' : 'normal'
              }}
            >
              All News
            </button>
            <button
              onClick={() => setSelectedFilter('SQUAD')}
              style={{
                background: selectedFilter === 'SQUAD' ? '#4f46e5' : '#1e1b4b',
                border: '1px solid #4338ca',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                fontWeight: selectedFilter === 'SQUAD' ? 'bold' : 'normal'
              }}
            >
              Squad Clubs Only
            </button>
            <button
              onClick={() => setSelectedFilter('INJURIES')}
              style={{
                background: selectedFilter === 'INJURIES' ? '#4f46e5' : '#1e1b4b',
                border: '1px solid #4338ca',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                fontWeight: selectedFilter === 'INJURIES' ? 'bold' : 'normal'
              }}
            >
              Injuries & Press
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search by manager, player, or club (e.g. Guardiola, Arsenal, Wissa)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: '#121422',
              border: '1px solid #282a4a',
              color: '#fff',
              padding: '9px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* News Feed Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
            Loading news articles...
          </div>
        ) : filteredNews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', background: '#121422', borderRadius: '8px' }}>
            No news articles found matching your query. Click "Refresh News Feed" to update from live feeds.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '12px'
          }}>
            {filteredNews.slice(0, 12).map((item, idx) => {
              const dateStr = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
              const cleanDescription = (item.description || '').replace(/<[^>]*>?/gm, '').trim();

              return (
                <div
                  key={item.id || idx}
                  style={{
                    background: '#121422',
                    border: '1px solid #242642',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {item.source || 'Premier League'}
                      </span>
                      {dateStr && (
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                          {dateStr}
                        </span>
                      )}
                    </div>

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#e0e7ff',
                        fontWeight: 'bold',
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        lineHeight: '1.4',
                        display: 'block',
                        marginBottom: '8px'
                      }}
                      onMouseOver={e => e.currentTarget.style.color = '#818cf8'}
                      onMouseOut={e => e.currentTarget.style.color = '#e0e7ff'}
                    >
                      {item.title}
                    </a>

                    {cleanDescription && (
                      <p style={{
                        color: '#94a3b8',
                        fontSize: '0.78rem',
                        lineHeight: '1.4',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {cleanDescription}
                      </p>
                    )}
                  </div>

                  {item.link && (
                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#818cf8', fontSize: '0.74rem', textDecoration: 'none', fontWeight: 'bold' }}
                      >
                        Read article ➔
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PressNewsDigest;
