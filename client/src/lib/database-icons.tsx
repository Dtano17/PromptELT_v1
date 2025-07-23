import snowflakeIcon from "@assets/snowflake_icon_1753195843639.png";
import databricksIcon from "@assets/databricks_icon_1753195858518.png";
import sqlServerIcon from "@assets/image_1753277616301.png";
import salesforceIcon from "@assets/image_1753195993314.png";

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

  const { width, height } = getSize();

  const getIcon = () => {
    switch (type) {
      case "snowflake":
        return (
          <img 
            src={snowflakeIcon} 
            alt="Snowflake" 
            style={{ width, height }}
            className="object-contain"
          />
        );
      case "databricks":
        return (
          <img 
            src={databricksIcon} 
            alt="Databricks" 
            style={{ width, height }}
            className="object-contain"
          />
        );
      case "sqlserver":
        return (
          <img 
            src={sqlServerIcon} 
            alt="SQL Server" 
            style={{ width, height }}
            className="object-contain"
          />
        );
      case "salesforce":
        return (
          <img 
            src={salesforceIcon} 
            alt="Salesforce" 
            style={{ width, height }}
            className="object-contain"
          />
        );
      default:
        return (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center justify-center">
      {getIcon()}
    </div>
  );
}