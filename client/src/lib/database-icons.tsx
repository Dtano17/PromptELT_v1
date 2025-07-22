interface DatabaseIconProps {
  type: string;
  size?: "sm" | "md" | "lg";
}

export function DatabaseIcon({ type, size = "md" }: DatabaseIconProps) {
  const getSize = () => {
    switch (size) {
      case "sm":
        return { width: 16, height: 16 };
      case "lg":
        return { width: 32, height: 32 };
      default:
        return { width: 24, height: 24 };
    }
  };

  const getColors = () => {
    switch (type) {
      case "snowflake":
        return { bg: "hsl(var(--snowflake))", icon: "white" };
      case "databricks":
        return { bg: "hsl(var(--databricks))", icon: "white" };
      case "sqlserver":
        return { bg: "#0078d4", icon: "white" };
      case "salesforce":
        return { bg: "#00a1e0", icon: "white" };
      default:
        return { bg: "#6b7280", icon: "white" };
    }
  };

  const { width, height } = getSize();
  const { bg, icon } = getColors();

  const getIcon = () => {
    switch (type) {
      case "snowflake":
        return (
          <svg width={width} height={height} viewBox="0 0 24 24" fill={icon}>
            <path d="M12 2l3.09 6.26L22 9l-5.91 1.26L12 16l-4.09-5.74L2 9l6.91-0.74L12 2z"/>
          </svg>
        );
      case "databricks":
        return (
          <svg width={width} height={height} viewBox="0 0 24 24" fill={icon}>
            <path d="M2 4h20v4H2V4zm0 6h20v4H2v-4zm0 6h20v4H2v-4z"/>
          </svg>
        );
      case "sqlserver":
        return (
          <svg width={width} height={height} viewBox="0 0 24 24" fill={icon}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        );
      case "salesforce":
        return (
          <svg width={width} height={height} viewBox="0 0 24 24" fill={icon}>
            <path d="M8.5 5.5c1.5-1.5 4-1.5 5.5 0 1 1 1.3 2.3.9 3.5 1.2-.4 2.6 0 3.5.9 1.5 1.5 1.5 4 0 5.5-1 1-2.3 1.3-3.5.9.4 1.2 0 2.6-.9 3.5-1.5 1.5-4 1.5-5.5 0-1-1-1.3-2.3-.9-3.5-1.2.4-2.6 0-3.5-.9-1.5-1.5-1.5-4 0-5.5 1-1 2.3-1.3 3.5-.9-.4-1.2 0-2.6.9-3.5z"/>
          </svg>
        );
      default:
        return (
          <svg width={width} height={height} viewBox="0 0 24 24" fill={icon}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        );
    }
  };

  return (
    <div 
      className={`w-6 h-6 rounded flex items-center justify-center`}
      style={{ backgroundColor: bg }}
    >
      {getIcon()}
    </div>
  );
}
