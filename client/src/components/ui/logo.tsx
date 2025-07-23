import promptEltLogo from "@assets/generated-image (3)_1753298764017.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "h-8 w-auto";
      case "md": return "h-12 w-auto";
      case "lg": return "h-16 w-auto";
      case "xl": return "h-24 w-auto";
      default: return "h-12 w-auto";
    }
  };

  return (
    <img 
      src={promptEltLogo} 
      alt="PromptELT" 
      className={`${getSizeClasses()} ${className} object-contain drop-shadow-lg`}
      style={{ 
        backgroundColor: 'transparent',
        filter: 'brightness(1.1) contrast(1.1)'
      }}
    />
  );
}