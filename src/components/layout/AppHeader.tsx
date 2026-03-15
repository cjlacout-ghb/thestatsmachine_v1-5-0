import { useState, useCallback, useRef, useEffect } from 'react';
import type { Team } from '../../types';

interface AppHeaderProps {
    activeTeam: Team | null;
    saveStatus: 'saved' | 'saving' | 'unsaved';
    lastSaveTime: Date | null;
    onOpenHelp: () => void;
    onSwitchTeam: () => void;
    onSaveToDisk: () => Promise<boolean>;
    onLoadFromDisk: () => void;
    onOpenErase: () => void;
    hasUnsavedChanges?: boolean;
}

export function AppHeader({
    activeTeam,
    saveStatus,
    lastSaveTime,
    onOpenHelp,
    onSwitchTeam,
    onSaveToDisk,
    onLoadFromDisk,
    onOpenErase,
    hasUnsavedChanges = false,
}: AppHeaderProps) {
    const [diskSaveConfirmed, setDiskSaveConfirmed] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleSaveToDisk = useCallback(async () => {
        const saved = await onSaveToDisk();
        if (saved) {
            setDiskSaveConfirmed(true);
            setTimeout(() => setDiskSaveConfirmed(false), 2000);
        }
    }, [onSaveToDisk]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    // --- Save status pill config ---
    const hasBackup = !!lastSaveTime;

    const statusConfig = (() => {
        if (saveStatus === 'saving') {
            return {
                dot: '#3b82f6',
                dotShadow: '0 0 8px rgba(59,130,246,0.6)',
                label: 'Guardando…',
                labelColor: 'var(--text-secondary)',
                pulse: true,
            };
        }
        if (hasBackup) {
            return {
                dot: 'var(--good)',
                dotShadow: '0 0 8px var(--good)',
                label: `Backup ${lastSaveTime!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                labelColor: 'var(--text-secondary)',
                pulse: false,
            };
        }
        // No backup yet this session
        return {
            dot: 'var(--average)',
            dotShadow: '0 0 8px var(--average)',
            label: 'Sin backup',
            labelColor: 'var(--average)',
            pulse: false,
        };
    })();

    return (
        <header className="app-header">
            <div className="header-content">
                {/* Logo / Title */}
                <div className="logo" onClick={onSwitchTeam} style={{ cursor: 'pointer' }}>
                    <div className="logo-icon header-logo-icon">🥎</div>
                    <div className="logo-text">
                        <h1>The Stats Machine</h1>
                        <span>v1.5.0</span>
                    </div>
                </div>

                {/* Right-side action cluster */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>

                    {/* ── Save status pill ── */}
                    <div
                        className="save-status-indicator"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'var(--bg-primary)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-light)',
                            whiteSpace: 'nowrap',
                        }}
                        title={
                            hasBackup
                                ? `Último backup guardado a disco: ${lastSaveTime!.toLocaleTimeString()}`
                                : 'No se ha guardado un respaldo en esta sesión. Usa 💾 Guardar para proteger tus datos.'
                        }
                    >
                        <div
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                flexShrink: 0,
                                background: statusConfig.dot,
                                boxShadow: statusConfig.dotShadow,
                                animation: statusConfig.pulse ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
                            }}
                        />
                        <span
                            style={{
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: statusConfig.labelColor,
                            }}
                        >
                            {statusConfig.label}
                        </span>
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '20px', background: 'var(--border-light)', flexShrink: 0 }} />

                    {/* ── 💾 Guardar — always visible, prominent ── */}
                    <button
                        id="btn-save-backup"
                        onClick={handleSaveToDisk}
                        title="Guardar una copia de respaldo en tu computadora (cuadro de diálogo Guardar como)"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            letterSpacing: '0.03em',
                            border: diskSaveConfirmed
                                ? '1px solid var(--good)'
                                : '1px solid var(--border-color)',
                            background: diskSaveConfirmed
                                ? 'var(--good)'
                                : !hasBackup
                                    ? 'var(--accent-gradient)'
                                    : 'var(--bg-subtle, #f8fafc)',
                            color: diskSaveConfirmed || !hasBackup ? 'white' : 'var(--text-primary)',
                            boxShadow: diskSaveConfirmed
                                ? '0 0 12px var(--good)'
                                : !hasBackup
                                    ? '0 4px 12px rgba(37,99,235,0.25)'
                                    : 'none',
                            transition: 'all 0.25s ease',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                            if (!diskSaveConfirmed) {
                                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                if (hasBackup) {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)';
                                }
                            }
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.transform = '';
                            if (hasBackup && !diskSaveConfirmed) {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                            }
                        }}
                    >
                        {diskSaveConfirmed ? '✅ ¡Guardado!' : '💾 Guardar'}
                    </button>

                    {/* ── 📥 Importar Datos — always visible, secondary ── */}
                    <button
                        id="btn-import-data"
                        onClick={onLoadFromDisk}
                        title="Restaurar un archivo de respaldo guardado previamente"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            letterSpacing: '0.03em',
                            border: '1px solid var(--border-color)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-primary)';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--text-muted)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
                        }}
                    >
                        ↑ Importar
                    </button>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '20px', background: 'var(--border-light)', flexShrink: 0 }} />

                    {/* ── ··· Menu ── */}
                    <div ref={menuRef} style={{ position: 'relative' }}>
                        <button
                            id="btn-more-menu"
                            onClick={() => setMenuOpen(v => !v)}
                            title="Más opciones"
                            aria-label="Más opciones"
                            aria-haspopup="true"
                            aria-expanded={menuOpen}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '34px',
                                height: '34px',
                                borderRadius: 'var(--radius-full)',
                                border: menuOpen
                                    ? '1px solid var(--border-color)'
                                    : '1px solid transparent',
                                background: menuOpen ? 'var(--bg-primary)' : 'transparent',
                                color: 'var(--text-secondary)',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                letterSpacing: '0.05em',
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                                if (!menuOpen) {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-primary)';
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!menuOpen) {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                                }
                            }}
                        >
                            ···
                        </button>

                        {/* Dropdown */}
                        {menuOpen && (
                            <div
                                role="menu"
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    minWidth: '220px',
                                    background: 'var(--bg-card, #ffffff)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: '0 10px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
                                    overflow: 'hidden',
                                    zIndex: 200,
                                    animation: 'dropdown-in 0.15s ease',
                                }}
                            >
                                {/* Help */}
                                <button
                                    role="menuitem"
                                    onClick={() => { setMenuOpen(false); onOpenHelp(); }}
                                    style={menuItemStyle()}
                                    onMouseEnter={e => applyMenuHover(e, false)}
                                    onMouseLeave={e => removeMenuHover(e)}
                                >
                                    <span style={{ fontSize: '1rem' }}>📖</span>
                                    <span>Ayuda y documentación</span>
                                </button>

                                {/* Separator */}
                                <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />

                                {/* Danger zone: Erase */}
                                <button
                                    role="menuitem"
                                    onClick={() => { setMenuOpen(false); onOpenErase(); }}
                                    style={menuItemStyle(true)}
                                    onMouseEnter={e => applyMenuHover(e, true)}
                                    onMouseLeave={e => removeMenuHover(e, true)}
                                >
                                    <span style={{ fontSize: '1rem' }}>🗑️</span>
                                    <span>Borrar todos los datos</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Keyframe injected inline for the pulse dot and dropdown animation */}
            <style>{`
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.85); }
                }
                @keyframes dropdown-in {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </header>
    );
}

// ── Helpers for menu item styling ──────────────────────────────────────────

function menuItemStyle(danger = false): React.CSSProperties {
    return {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 16px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: danger ? '#ef4444' : 'var(--text-primary)',
        textAlign: 'left',
        transition: 'background 0.15s ease',
        fontFamily: 'var(--font-sans)',
    };
}

function applyMenuHover(e: React.MouseEvent<HTMLButtonElement>, danger: boolean) {
    const el = e.currentTarget as HTMLButtonElement;
    el.style.background = danger ? 'rgba(239,68,68,0.07)' : 'var(--bg-primary)';
}

function removeMenuHover(e: React.MouseEvent<HTMLButtonElement>, _danger = false) {
    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
}
