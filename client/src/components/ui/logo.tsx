import promptEltLogo from "@assets/generated-image_1753298328578.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "h-6 w-auto";
      case "md": return "h-8 w-auto";
      case "lg": return "h-12 w-auto";
      case "xl": return "h-16 w-auto";
      default: return "h-8 w-auto";
    }
  };

  return (
    <img 
      src={promptEltLogo} 
      alt="PromptELT" 
      className={`${getSizeClasses()} ${className} object-contain`}
      style={{ backgroundColor: 'transparent' }}
    />
  );
}