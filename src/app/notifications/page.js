import React from "react";
import NotificationsList from "../../Components/Notifications/NotificationsList";

const NotificationsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <NotificationsList />
    </div>
  );
};

export default NotificationsPage;
