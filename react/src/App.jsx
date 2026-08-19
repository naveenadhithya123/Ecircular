import { useEffect } from "react";
import "./styles.css";
import "./legacyApp.js";

export default function App() {
  useEffect(() => {
    window.dispatchEvent(new Event("ecircular:react-ready"));
  }, []);

  return <div id="app" />;
}
