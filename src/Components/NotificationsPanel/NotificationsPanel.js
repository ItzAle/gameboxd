import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "userNotifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notificationsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsList);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const renderNotification = (notification) => {
    switch (notification.type) {
      case "game_release":
        return (
          <div key={notification.id} className="bg-blue-100 p-2 rounded mb-2">
            <p className="font-bold">{notification.message}</p>
            <small>{notification.createdAt.toDate().toLocaleString()}</small>
          </div>
        );
      // Añade más casos para otros tipos de notificaciones
      default:
        return (
          <div key={notification.id} className="bg-gray-100 p-2 rounded mb-2">
            <p>{notification.message}</p>
            <small>{notification.createdAt.toDate().toLocaleString()}</small>
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-4">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {notifications.length > 0 ? (
        notifications.map(renderNotification)
      ) : (
        <p>No notifications yet.</p>
      )}
    </div>
  );
};

export default NotificationsPanel;
