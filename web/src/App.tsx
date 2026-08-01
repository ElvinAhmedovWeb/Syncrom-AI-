import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootGate from "./RootGate";
import Landing from "./pages/Landing";
import About from "./pages/About";
import ChatPage from "./pages/Chat";
import VellaPage from "./pages/Vella";
import SchalaPage from "./pages/Schala";
import NoemelPage from "./pages/Noemel";
import { LanguageProvider } from "./lib/i18n";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootGate />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/vella" element={<VellaPage />} />
          <Route path="/schala" element={<SchalaPage />} />
          <Route path="/noemel" element={<NoemelPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
