import React from 'react';
import './ProfileAssets.css';

const ProfileAssets = ({ profileData, assetData }) => {
    if (!profileData || !assetData) return null;

    return (
        <div className="profile-assets-container">
            <section className="profile-section">
                <h2 className="section-title">👤 Personal Background</h2>
                <div className="profile-card">
                    <div className="profile-info-grid">
                        <div className="info-group">
                            <label>Full Name</label>
                            <p>{profileData.fullName}</p>
                        </div>
                        <div className="info-group">
                            <label>Date of Birth</label>
                            <p>{profileData.dob}</p>
                        </div>
                        <div className="info-group">
                            <label>Place of Birth</label>
                            <p>{profileData.placeOfBirth}</p>
                        </div>
                        <div className="info-group">
                            <label>Education</label>
                            <p>{profileData.education}</p>
                        </div>
                        <div className="info-group">
                            <label>Spouse</label>
                            <p>{profileData.spouse}</p>
                        </div>
                        <div className="info-group">
                            <label>Children</label>
                            <p>{profileData.children}</p>
                        </div>
                    </div>
                    <div className="profile-bio">
                        <label>Biography</label>
                        <p>{profileData.bio}</p>
                    </div>
                </div>
            </section>

            <section className="assets-section">
                <h2 className="section-title">💰 Asset Disclosures (2024)</h2>
                <div className="assets-summary-grid">
                    <div className="summary-card movable">
                        <h3>Movable Assets</h3>
                        <p className="amount">{assetData.movableTotal}</p>
                        <span className="subtitle">Cash, Bank, Jewelry, etc.</span>
                    </div>
                    <div className="summary-card immovable">
                        <h3>Immovable Assets</h3>
                        <p className="amount">{assetData.immovableTotal}</p>
                        <span className="subtitle">Land, Buildings, etc.</span>
                    </div>
                    <div className="summary-card liabilities">
                        <h3>Total Liabilities</h3>
                        <p className="amount">{assetData.liabilitiesTotal}</p>
                        <span className="subtitle">Loans & Dues</span>
                    </div>
                    <div className="summary-card net-worth">
                        <h3>Net Worth (Est.)</h3>
                        <p className="amount">₹2.3 Crores</p>
                        <span className="subtitle">Movable + Immovable - Liabilities</span>
                    </div>
                </div>

                <div className="assets-detail-grid">
                    <div className="detail-card">
                        <h3>Detailed Movable Assets</h3>
                        <table className="assets-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assetData.movableDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="detail-card">
                        <h3>Detailed Immovable Assets</h3>
                        <table className="assets-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assetData.immovableDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="detail-card full-width">
                        <h3>Detailed Liabilities</h3>
                        <table className="assets-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assetData.liabilitiesDetails.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProfileAssets;
