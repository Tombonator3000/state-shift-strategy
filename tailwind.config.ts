import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        "government-blue": "hsl(var(--government-blue))",
        "government-dark": "hsl(var(--government-dark))",
        "truth-red": "hsl(var(--truth-red))",
        "secret-red": "hsl(var(--secret-red))",
        victory: {
          start: "hsl(var(--victory-gradient-start))",
          mid: "hsl(var(--victory-gradient-mid))",
          end: "hsl(var(--victory-gradient-end))",
          foreground: "hsl(var(--victory-foreground))",
          accent: "hsl(var(--victory-accent))",
        },
        "newspaper-bg": "hsl(var(--newspaper-bg))",
        "newspaper-text": "hsl(var(--newspaper-text))",
        "newspaper-header": "hsl(var(--newspaper-header))",
        "newspaper-border": "hsl(var(--newspaper-border))",
        "newspaper-accent": "hsl(var(--newspaper-accent))",
        "newspaper-headline": "hsl(var(--newspaper-headline))",
        paper: "var(--pt-paper)",
        ink: "var(--pt-ink)",
        truth: "var(--pt-truth)",
        gov: "var(--pt-gov)",
        rarity: {
          common: "var(--pt-rarity-common)",
          uncommon: "var(--pt-rarity-uncommon)",
          rare: "var(--pt-rarity-rare)",
          legendary: "var(--pt-rarity-legendary)"
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        tabloid: "var(--pt-radius)",
      },
      fontFamily: {
        headline: ["Anton", "Bebas Neue", "system-ui", "sans-serif"],
        tabloid: ["Bebas Neue", "Anton", "system-ui", "sans-serif"],
      },
      boxShadow: {
        tabloid: "0 6px 24px var(--pt-shadow)",
      },
      height: {
        cardH: "var(--pt-card-h)",
      },
      width: {
        cardW: "var(--pt-card-w)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "glitch": {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" }
        },
        "redacted-reveal": {
          "0%": { opacity: "0", filter: "blur(10px)" },
          "50%": { opacity: "0.5", filter: "blur(5px)" },
          "100%": { opacity: "1", filter: "blur(0)" }
        },
        "card-deal": {
          "0%": { 
            transform: "translateY(-100px) rotate(15deg)",
            opacity: "0"
          },
          "100%": { 
            transform: "translateY(0) rotate(0deg)",
            opacity: "1"
          }
        },
        "card-play": {
          "0%": { 
            transform: "scale(1) translateY(0)",
            opacity: "1"
          },
          "50%": { 
            transform: "scale(1.1) translateY(-20px)",
            opacity: "0.8"
          },
          "100%": { 
            transform: "scale(0.8) translateY(-100px)",
            opacity: "0"
          }
        },
        "truth-pulse": {
          "0%, 100%": { 
            transform: "scale(1)",
            filter: "brightness(1)"
          },
          "50%": { 
            transform: "scale(1.05)",
            filter: "brightness(1.2)"
          }
        },
        "conspiracy-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "synergy-pulse": {
          "0%, 100%": { 
            transform: "scale(1)",
            filter: "brightness(1) saturate(1)"
          },
          "50%": { 
            transform: "scale(1.05)",
            filter: "brightness(1.2) saturate(1.3)"
          }
        },
        "combo-burst": {
          "0%": { 
            transform: "scale(0.5) rotate(0deg)",
            opacity: "0"
          },
          "50%": { 
            transform: "scale(1.2) rotate(180deg)",
            opacity: "1"
          },
          "100%": { 
            transform: "scale(1) rotate(360deg)",
            opacity: "1"
          }
        },
        "chain-reaction": {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "25%": { transform: "translateX(10px)", opacity: "0.7" },
          "50%": { transform: "translateX(-5px)", opacity: "1" },
          "75%": { transform: "translateX(5px)", opacity: "0.7" },
          "100%": { transform: "translateX(0px)", opacity: "0" }
        },
        "objective-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
            transform: "translateZ(0)",
            filter: "brightness(1)"
          },
          "40%": {
            boxShadow: "0 0 0 6px rgba(255, 255, 255, 0.06)",
            filter: "brightness(1.06)"
          },
          "60%": {
            boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.04)",
            filter: "brightness(1.03)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glitch": "glitch 0.3s ease-in-out",
        "redacted-reveal": "redacted-reveal 0.8s ease-out",
        "card-deal": "card-deal 0.6s ease-out",
        "card-play": "card-play 0.8s ease-in",
        "truth-pulse": "truth-pulse 2s ease-in-out infinite",
        "conspiracy-float": "conspiracy-float 3s ease-in-out infinite",
        "synergy-pulse": "synergy-pulse 1.5s ease-in-out infinite",
        "combo-burst": "combo-burst 0.8s ease-out",
        "chain-reaction": "chain-reaction 1.2s ease-in-out",
        "objective-pulse": "objective-pulse 2.4s ease-in-out infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
