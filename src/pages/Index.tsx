import { MVPGameBoard } from "@/components/mvp/MVPGameBoard";
import { useUiTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { Toaster } from "sonner";

const Index = () => {
  const [theme, setTheme] = useUiTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "tabloid_bw" ? "government_classic" : "tabloid_bw")}
          className="h-9 w-9"
        >
          {theme === "tabloid_bw" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>

      <MVPGameBoard />
      <Toaster />
    </div>
  );
};

export default Index;