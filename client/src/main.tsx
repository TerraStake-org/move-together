import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Web3Provider } from "@/context/Web3Context";
import { LocationProvider } from "@/context/LocationContext";

createRoot(document.getElementById("root")!).render(
  <Web3Provider>
    <LocationProvider>
      <App />
    </LocationProvider>
  </Web3Provider>
);
