import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthScreen from "../components/AuthScreen";
import { watchAuth } from "../lib/firebase";

export default function Login() {
  const navigate = useNavigate();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const unsub = watchAuth((user) => {
      if (user) {
        navigate("/chat", { replace: true });
      } else {
        setBooting(false);
      }
    });
    return unsub;
  }, [navigate]);

  if (booting) {
    return (
      <div className="boot">
        <img src="/favicon.png" alt="Syncrom AI" />
        <div className="boot-bar">
          <i />
        </div>
      </div>
    );
  }

  return (
    <AuthScreen 
      logoSrc="/favicon.png" 
      onBackHome={() => navigate("/")} 
    />
  );
}
