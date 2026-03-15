import { useState, useEffect } from 'react';
import type { TabId, Tournament, Team } from '../../types';

interface SidebarProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
    activeTeam: Team | null;
    activeTournament: Tournament | null;
    onExitTournament: () => void;
    tournaments?: Tournament[];
    onSelectTournament?: (t: Tournament) => void;
    onManageTournament?: (t: Tournament) => void;
    onSwitchTeam: () => void;
}

export function Sidebar({ 
    activeTab, 
    setActiveTab, 
    activeTeam, 
    activeTournament, 
    onExitTournament, 
    tournaments = [], 
    onSelectTournament,
    onManageTournament,
    onSwitchTeam
}: SidebarProps) {
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
    const [isManageOpen, setIsManageOpen] = useState(false);

    // Sync expanded accordion with active tournament
    useEffect(() => {
        if (activeTournament) {
            setExpandedAccordion(activeTournament.id);
        }
    }, [activeTournament]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => setIsManageOpen(false);
        if (isManageOpen) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isManageOpen]);

    const toggleAccordion = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedAccordion(prev => prev === id ? null : id);
    };

    if (!activeTeam) return null;

    return (
        <aside className="app-sidebar">
            {/* 1. TEAM SWITCHER (Replaces old top-level label) */}
            <div className="sidebar-group" style={{ marginBottom: '0', padding: '0 var(--space-sm)' }}>
                <button 
                    className="sidebar-team-switcher"
                    onClick={onSwitchTeam}
                    title="Cambiar Equipo Activo"
                    style={{ justifyContent: 'center' }}
                >
                    <span className="team-name" style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 800 }}>CAMBIAR EQUIPO</span>
                </button>
            </div>

            <div className="sidebar-divider" style={{ margin: 'var(--space-md) 0' }}></div>

            {/* 2. EQUIPO SECTION */}
            <div className="sidebar-group">
                <h3 className="sidebar-header" style={{ marginLeft: 'var(--space-sm)' }}>EQUIPO</h3>
                <nav className="sidebar-nav">
                    <button
                        className={`sidebar-item ${activeTab === 'team' && !activeTournament ? 'active' : ''}`}
                        onClick={() => { onExitTournament(); setActiveTab('team'); }}
                    >
                        <span className="icon">🏢</span>
                        <span>Resumen de Equipo</span>
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'players' && !activeTournament ? 'active' : ''}`}
                        onClick={() => { onExitTournament(); setActiveTab('players'); }}
                    >
                        <span className="icon">👥</span>
                        <span>Jugadores</span>
                    </button>
                    <button
                        className={`sidebar-item ${activeTab === 'stats' && !activeTournament ? 'active' : ''}`}
                        onClick={() => { onExitTournament(); setActiveTab('stats'); }}
                    >
                        <span className="icon">📊</span>
                        <span>Estadísticas Individuales</span>
                    </button>
                </nav>
            </div>

            <div className="sidebar-divider" style={{ margin: 'var(--space-lg) 0' }}></div>

            {/* 3. TORNEOS SECTION */}
            <div className="sidebar-group flex-1">
                <h3 className="sidebar-header" style={{ marginLeft: 'var(--space-sm)' }}>TORNEOS</h3>
                
                <nav className="sidebar-nav">
                    {/* The "Selector de Contexto" for Administration */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className={`sidebar-item ${isManageOpen ? 'active' : ''} ${activeTab === 'tournaments' && !activeTournament ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsManageOpen(!isManageOpen);
                            }}
                        >
                            <span className="icon">🏆</span>
                            <span>Administrar Torneos</span>
                            <span className={`chevron ${isManageOpen ? 'rotated' : ''}`} style={{ marginLeft: 'auto' }}>▾</span>
                        </button>

                        {isManageOpen && (
                            <div className="sidebar-dropdown-menu" onClick={e => e.stopPropagation()}>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => {
                                        onExitTournament();
                                        setActiveTab('tournaments');
                                        setIsManageOpen(false);
                                    }}
                                >
                                    <span className="icon">📑</span>
                                    <span>Ver Resumen General</span>
                                </button>
                                <div className="dropdown-divider"></div>
                                {tournaments.map(t => (
                                    <button 
                                        key={t.id} 
                                        className="dropdown-item"
                                        onClick={() => {
                                            if (onManageTournament) onManageTournament(t);
                                            setIsManageOpen(false);
                                        }}
                                    >
                                        <span className="icon">🏆</span>
                                        <span className="text-truncate">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Accordions per Tournament */}
                    <div className="tournaments-accordion-list">
                        {tournaments.map(t => {
                            const isExpanded = expandedAccordion === t.id;
                            const isActiveTournament = activeTournament?.id === t.id;
                            
                            return (
                                <div key={t.id} className="accordion-item">
                                    <button 
                                        className={`accordion-header sidebar-item ${isActiveTournament ? 'active-parent' : ''}`}
                                        onClick={(e) => {
                                            toggleAccordion(t.id, e);
                                            // Optional: If we want clicking the header to also select it
                                            if (!isExpanded && onSelectTournament) {
                                                onSelectTournament(t);
                                            }
                                        }}
                                        title={t.name}
                                    >
                                        <span className="icon">🏆</span>
                                        <span className="accordion-title">{t.name}</span>
                                        <span className={`chevron ${isExpanded ? 'rotated' : ''}`}>▾</span>
                                    </button>

                                    {/* Expanded Content (Sub-views) */}
                                    {isExpanded && (
                                        <div className="accordion-body">
                                            <button
                                                className={`sidebar-item sub-item ${(activeTab === 'games' || activeTab === 'tournaments') && isActiveTournament ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (onSelectTournament) onSelectTournament(t);
                                                    setActiveTab('games');
                                                }}
                                            >
                                                <div className="tree-line"></div>
                                                <span className="dot"></span>
                                                <span>Partidos / Récord</span>
                                            </button>
                                            
                                            <button
                                                className={`sidebar-item sub-item ${activeTab === 'stats' && isActiveTournament ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (onSelectTournament) onSelectTournament(t);
                                                    setActiveTab('stats');
                                                }}
                                            >
                                                <div className="tree-line"></div>
                                                <span className="dot"></span>
                                                <span>Estadísticas de Equipo</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Tournament Button pinned to bottom of list */}
                    <button
                        className="sidebar-item"
                        onClick={() => { onExitTournament(); setActiveTab('tournaments'); }}
                        style={{ marginTop: 'var(--space-md)', color: 'var(--text-muted)' }}
                    >
                        <span className="icon" style={{ opacity: 0.5 }}>+</span>
                        <span>Agregar torneo</span>
                    </button>
                    
                </nav>
            </div>
        </aside>
    );
}
