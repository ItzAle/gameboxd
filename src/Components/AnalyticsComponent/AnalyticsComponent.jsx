// En un componente React o en cualquier archivo que se ejecute solo en el cliente
import { useEffect } from "react";
import { analytics } from "../lib/firebase"; // Ajusta la ruta según tu estructura

const AnalyticsComponent = () => {
  useEffect(() => {
    if (analytics) {
      // Usa analytics aquí
    }
  }, [analytics]);

  return <div>Analytics Component</div>;
};

export default AnalyticsComponent;
