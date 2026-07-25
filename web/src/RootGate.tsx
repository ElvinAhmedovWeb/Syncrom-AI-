import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import { isFirebaseReady, watchAuth, type User } from "./lib/firebase";

// Kök ünvan ("/") üçün qapı:
//  - İstifadəçi HESABLA login olubsa → birbaşa /chat-ə yönləndirilir.
//  - Login olmayıbsa (yeni ziyarətçi) → marketing Landing səhifəsi göstərilir.
// Auth vəziyyəti həll olana qədər qısa boot ekranı göstərilir ki, əvvəl landing
// görünüb sonra chat-ə "sıçrayış" (flash) baş verməsin.
export default function RootGate() {
  const [resolved, setResolved] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isFirebaseReady()) {
      // Firebase yoxdursa auth mümkün deyil — landing göstər.
      setResolved(true);
      return;
    }
    const unsub = watchAuth((u) => {
      setUser(u);
      setResolved(true);
    });
    return unsub;
  }, []);

  if (!resolved) {
    return (
      <div className="boot">
        <img src="/favicon.png" alt="Syncrom AI" />
        <div className="boot-bar">
          <i />
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  return <Landing />;
}
