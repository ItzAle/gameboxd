"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";
import { FaBell, FaTrash, FaCheck, FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      const notificationsRef = collection(db, "userNotifications");
      const q = query(
        notificationsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(notificationsData);
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (notificationId) => {
    await updateDoc(doc(db, "userNotifications", notificationId), {
      read: true,
    });

    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = async (notificationId) => {
    await deleteDoc(doc(db, "userNotifications", notificationId));
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case "game_release":
        return (
          <>
            <FaBell className="text-yellow-400 mt-1" />
            <div>
              <p className="text-white">
                <Link href={`/games/${notification.gameId}`}>
                  <span className="font-semibold hover:underline cursor-pointer">
                    {notification.gameName}
                  </span>
                </Link>
                has been released!
              </p>
            </div>
          </>
        );
      case "new_follower":
        return (
          <>
            <FaUser className="text-blue-400 mt-1" />
            <div>
              <p className="text-white">
                <Link href={`/user/${notification.followerId}`}>
                  <span className="font-semibold hover:underline cursor-pointer">
                    {notification.followerName}
                  </span>
                </Link>{" "}
                started following you!
              </p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg shadow-md ${
              notification.read ? "bg-gray-800" : "bg-blue-900"
            } transition-colors duration-300`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {renderNotificationContent(notification)}
              </div>
              <div className="flex space-x-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-green-400 hover:text-green-300 transition-colors duration-300"
                    title="Mark as read"
                  >
                    <FaCheck />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-300"
                  title="Delete notification"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(notification.createdAt.toDate()).toLocaleString()}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
      {notifications.length === 0 && (
        <p className="text-center text-gray-400">No notifications yet.</p>
      )}
    </div>
  );
};

export default NotificationsList;
