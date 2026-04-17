interface MapToggleProps {
  on: boolean;
  onToggle: () => void;
  partial?: boolean;
  isDark: boolean;
  small?: boolean;
}

export function MapToggle({
  on,
  onToggle,
  partial,
  isDark,
  small,
}: MapToggleProps) {
  const w = small ? 30 : 36;
  const h = small ? 16 : 20;
  const knob = small ? 12 : 16;
  const pad = 2;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{
        position: 'relative',
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: `${h / 2}px`,
        backgroundColor: on
          ? '#FF7A2F'
          : isDark
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(14,34,63,0.15)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 200ms',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: `${pad}px`,
          left: on ? `${w - knob - pad}px` : `${pad}px`,
          width: `${knob}px`,
          height: `${knob}px`,
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          opacity: partial ? 0.6 : 1,
          transition: 'left 200ms, opacity 200ms',
        }}
      />
    </button>
  );
}
