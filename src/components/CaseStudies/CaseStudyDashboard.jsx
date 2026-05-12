import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { motion } from 'motion/react';
import './CaseStudyDashboard.css';

const CaseStudyDashboard = ({ study, onClose }) => {
    if (!study) return null;

    const { detailed, color } = study;

    return (
        <motion.div 
            className="dashboard-overlay"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100dvh',
                background: 'rgba(0,0,0,0.98)',
                backdropFilter: 'blur(30px)',
                zIndex: 10000,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                color: 'white',
                padding: '60px 40px'
            }}
        >
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <span style={{ fontSize: '4rem', color: color, filter: `drop-shadow(0 0 20px ${color}66)` }}>
                            {React.createElement(study.icon)}
                        </span>
                        <div>
                            <h1 style={{ fontSize: '3.5rem', margin: 0, fontWeight: 900, letterSpacing: '-0.03em' }}>{study.title}</h1>
                            <p style={{ opacity: 0.5, fontSize: '1.2rem', margin: '5px 0 0 0' }}>{study.subtitle}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: 'white', 
                            padding: '15px 30px', 
                            borderRadius: '100px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        Back to Portfolio
                    </button>
                </header>

                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '30px' }}>
                    
                    {/* Background & Problem */}
                    <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div className="content-card">
                            <h3>Background</h3>
                            <p>{study.background}</p>
                        </div>
                        <div className="content-card">
                            <h3>The Problem</h3>
                            <p>{study.problem}</p>
                        </div>
                    </div>

                    {/* Main Chart */}
                    <div className="chart-card" style={{ gridColumn: 'span 8', minHeight: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h3 style={{ margin: 0 }}>Growth & Performance Trends</h3>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                {study.tech.map(t => (
                                    <span key={t} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.1)' }}>{t}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={detailed.trends}>
                                    <defs>
                                        <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Proposed Solution */}
                    <div className="chart-card" style={{ gridColumn: 'span 7' }}>
                        <h3>Proposed Solution</h3>
                        <div style={{ fontSize: '1.4rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', fontWeight: 300 }}>
                            {study.solution}
                        </div>
                        <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: color, textTransform: 'uppercase', letterSpacing: '2px' }}>Expected Impact</h4>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}>{study.impact}</p>
                        </div>
                    </div>

                    {/* Benchmarks / Metrics */}
                    <div className="chart-card" style={{ gridColumn: 'span 5' }}>
                        <h3>Benchmark Metrics</h3>
                        <div style={{ width: '100%', height: '300px', marginTop: '20px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={detailed.metrics}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} width={100} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ background: '#111', border: 'none', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                                        {detailed.metrics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={color} opacity={0.6 + (index * 0.2)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .content-card {
                    background: rgba(255, 255, 255, 0.03);
                    padding: 30px;
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .content-card h3 {
                    margin: 0 0 15px 0;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: rgba(255, 255, 255, 0.4);
                }
                .content-card p {
                    margin: 0;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.8);
                }
                .chart-card {
                    background: rgba(255, 255, 255, 0.02);
                    padding: 40px;
                    border-radius: 32px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                }
                .chart-card h3 {
                    margin: 0 0 30px 0;
                    font-size: 1.2rem;
                    color: #fff;
                }
            `}</style>
        </motion.div>
    );
};

export default CaseStudyDashboard;
