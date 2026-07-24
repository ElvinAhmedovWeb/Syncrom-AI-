import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ChatPage from "./pages/Chat";
import VellaPage from "./pages/Vella";
import SchalaPage from "./pages/Schala";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/vella" element={<VellaPage />} />
        <Route path="/schala" element={<SchalaPage />} />
      </Routes>
    </BrowserRouter>
  );
}
