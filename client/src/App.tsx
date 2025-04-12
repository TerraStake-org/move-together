import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import MapView from "@/pages/MapView";
import ActivityPage from "@/pages/ActivityPage";
import WalletScreen from "@/pages/WalletScreen";
import RewardsPage from "@/pages/RewardsPage";
import ProfilePage from "@/pages/ProfilePage";
import BottomNavigation from "@/components/ui/BottomNavigation";
import { useEffect, useState } from "react";

function Router() {
  const [location] = useLocation();

  // Determine active tab from route (matching the React Native navigation structure)
  const getActiveTabFromLocation = (path: string) => {
    if (path === "/") return "map";
    if (path === "/wallet") return "wallet";
    if (path === "/rewards") return "rewards";
    if (path === "/profile") return "profile";
    return "map"; // Default
  };

  const activeTab = getActiveTabFromLocation(location);

  return (
    <>
      <Switch>
        <Route path="/" component={MapView} />
        <Route path="/wallet" component={ActivityPage} /> {/* Using ActivityPage as a placeholder for WalletScreen */}
        <Route path="/rewards" component={RewardsPage} />
        <Route path="/profile" component={ProfilePage} /> {/* Using ProfilePage as a placeholder for SettingsScreen */}
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation activeTab={activeTab} />
    </>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Set dark mode class on document
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-dark text-white">
        <Router />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
