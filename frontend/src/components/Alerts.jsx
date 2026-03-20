import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Alerts() {

  useEffect(() => {
    const shownAlerts = new Set();

    const fetchAlerts = () => {
      fetch("http://127.0.0.1:8000/alerts")
        .then(res => res.json())
        .then(data => {
          data.forEach((alert) => {
            
            // prevent duplicate spam
            if (!shownAlerts.has(alert)) {
              shownAlerts.add(alert);

              if (alert.includes("FULL")) {
                toast.error(alert);
              } else {
                toast.warn(alert);
              }

              // remove after some time to allow re-alert
              setTimeout(() => shownAlerts.delete(alert), 5000);
            }
          });
        });
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  return null; // no UI needed
}