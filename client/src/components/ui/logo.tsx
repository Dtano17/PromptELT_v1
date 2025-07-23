import { useTheme } from "@/hooks/use-theme";
import promptEltLightLogo from "@assets/promptELT_light_background_logo_1753297754370.png";
import promptEltDarkLogo from "@assets/promptELT_dark_background_logo_1753297754368.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const { theme } = useTheme();
  
  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "h-6 w-auto";
      case "md": return "h-8 w-auto";
      case "lg": return "h-12 w-auto";
      case "xl": return "h-16 w-auto";
      default: return "h-8 w-auto";
    }
  };

  // Use dark logo for dark theme (dark webapp background)
  // Use light logo for light theme (light webapp background)
  const logoSrc = theme === "dark" ? promptEltDarkLogo : promptEltLightLogo;

  return (
    <img 
      src={logoSrc} 
      alt="PromptELT" 
      className={`${getSizeClasses()} ${className} mix-blend-multiply dark:mix-blend-screen`}
    />
  );
}