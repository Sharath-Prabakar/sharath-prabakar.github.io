import React from 'react';

const NewsFeed = ({ news = [] }) => {
  // Sample data for demonstration if no news is provided
  const sampleNews = [
    {
      id: 1,
      title: "Economic Reform Bill Passed in Parliament",
      source: "Global News",
      date: "Oct 25, 2023",
      thumbnail: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=400&fit=crop",
      credibility: "High"
    },
    {
      id: 2,
      title: "New Environmental Regulations Proposed",
      source: "Eco Watch",
      date: "Oct 24, 2023",
      thumbnail: "https://images.unsplash.com/photo-1501854140801-50d01674db4e?w=400&h=400&fit=crop",
      credibility: "Medium"
    },
    {
      id: 3,
      title: "Infrastructure Project Reaches Major Milestone",
      source: "Metro Daily",
      date: "Oct 23, 2023",
      thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
      credibility: "High"
    }
  ];

  const newsList = news.length > 0 ? news : sampleNews;

  return (
    <div className="news-feed-container">
      <div className="flex flex-col gap-6">
        {newsList.map((item) => (
          <div 
            key={item.id} 
            className="bg-white news-item-card overflow-hidden hover:scale-[1.01] transition-all duration-300 border border-gray-100 shadow-sm"
          >
            <div className="flex flex-col md:row">
              {/* Thumbnail */}
              <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
 
              {/* Content */}
              <div className="p-6 flex flex-col justify-between flex-grow bg-gradient-to-br from-white/5 to-transparent">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded">
                      {item.source}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                </div>
 
                <div className="flex items-center mt-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    item.credibility === 'High' 
                      ? 'bg-emerald-600 text-white border-emerald-700' 
                      : 'bg-amber-600 text-white border-amber-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      item.credibility === 'High' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    {item.credibility} Credibility
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
