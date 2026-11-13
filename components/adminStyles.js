export const adminPanelStyle = {
  background: 'rgba(11, 15, 22, 0.6)',
  border: '1px solid rgba(148, 163, 184, 0.15)',
  borderRadius: '4px',
  overflow: 'hidden',
};

export const adminPanelHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
  padding: '12px 20px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
  background: 'rgba(0, 0, 0, 0.3)',
  color: 'var(--blue)',
  fontSize: '12px',
  fontFamily: "'DM Mono', monospace",
  letterSpacing: '1px',
};

export const adminInputStyle = {
  width: '100%',
  minWidth: 0,
  minHeight: '44px',
  padding: '11px 14px',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  color: '#f5f7fb',
  fontSize: '13px',
  borderRadius: '4px',
  fontFamily: "'DM Mono', monospace",
  boxSizing: 'border-box',
  outline: 'none',
};

export const adminPrimaryButtonStyle = {
  minHeight: '44px',
  padding: '10px 18px',
  background: 'rgba(63, 131, 248, 0.14)',
  color: '#8db8ff',
  border: '1px solid rgba(63, 131, 248, 0.35)',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '11px',
  fontFamily: "'DM Mono', monospace",
  letterSpacing: '0.04em',
  touchAction: 'manipulation',
};

export const adminDangerButtonStyle = {
  ...adminPrimaryButtonStyle,
  background: 'rgba(255, 38, 64, 0.1)',
  color: '#ff7b8b',
  border: '1px solid rgba(255, 38, 64, 0.3)',
};

export const adminSuccessButtonStyle = {
  ...adminPrimaryButtonStyle,
  background: 'rgba(76, 175, 80, 0.1)',
  color: '#75d28a',
  border: '1px solid rgba(76, 175, 80, 0.3)',
};

export const adminEmptyStateStyle = {
  padding: '32px 20px',
  textAlign: 'center',
  color: '#8b98aa',
  fontSize: '13px',
  lineHeight: 1.6,
};
