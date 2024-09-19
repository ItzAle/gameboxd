import React, { useState, useEffect, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { motion, AnimatePresence } from "framer-motion";
import RecentGamesGrid from "../RecentGamesGrid/RecentGamesGrid";
import HomeFeed from "../HomeFeed/HomeFeed";
import FavoriteGames from "../FavoriteGames/FavoriteGames";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "../../utils/customScrollbar.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const componentMap = {
  RecentGamesGrid: RecentGamesGrid,
  HomeFeed: HomeFeed,
  FavoriteGames: FavoriteGames,
};

const CustomizableHomePage = () => {
  const [layout, setLayout] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [removedComponents, setRemovedComponents] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const { user } = useAuth();
  const longPressTimer = useRef(null);

  useEffect(() => {
    const fetchUserLayout = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const savedLayout = userData.homeLayout || [
            { i: "RecentGamesGrid", x: 0, y: 0, w: 6, h: 2 },
            { i: "HomeFeed", x: 6, y: 0, w: 6, h: 2 },
            {
              i: "FavoriteGames",
              x: 0,
              y: 2,
              w: 12,
              h: 2,
              minW: 6,
              minH: 2,
              maxH: 2,
              maxW: 12,
            },
          ];
          setLayout(savedLayout);
          setRemovedComponents(
            Object.keys(componentMap).filter(
              (comp) => !savedLayout.some((item) => item.i === comp)
            )
          );
        }
      }
    };
    fetchUserLayout();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu && !event.target.closest(".context-menu")) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (isEditing) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const saveLayout = async () => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const validLayout = layout.map((item) => {
        const validItem = {
          i: item.i,
          x: item.x || 0,
          y: item.y || 0,
          w: item.w || 1,
          h: item.h || 1,
        };
        if (item.minW !== undefined) validItem.minW = item.minW;
        if (item.minH !== undefined) validItem.minH = item.minH;
        if (item.maxH !== undefined) validItem.maxH = item.maxH;
        if (item.maxW !== undefined) validItem.maxW = item.maxW;
        return validItem;
      });
      await updateDoc(userRef, { homeLayout: validLayout });
      setIsEditing(false);
    }
  };

  const removeComponent = (componentName) => {
    setLayout((prevLayout) =>
      prevLayout.filter((item) => item.i !== componentName)
    );
    setRemovedComponents((prevRemoved) => [...prevRemoved, componentName]);
    setContextMenu(null);
  };

  const addComponent = (componentName, gridX, gridY) => {
    const newItem = {
      i: componentName,
      x: gridX,
      y: gridY,
      w: componentName === "FavoriteGames" ? 12 : 6,
      h: 2,
      ...(componentName === "FavoriteGames"
        ? { minW: 6, minH: 2, maxH: 2, maxW: 12 }
        : {}),
    };
    setLayout((prevLayout) => [...prevLayout, newItem]);
    setRemovedComponents((prevRemoved) =>
      prevRemoved.filter((comp) => comp !== componentName)
    );
  };

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (isEditing) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const componentElement = e.target.closest(".react-grid-item");
      const componentName = componentElement
        ? componentElement.getAttribute("data-grid-id")
        : null;
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        gridX: Math.floor(x / 100),
        gridY: Math.floor(y / 100),
        isAddingComponent: !componentName,
        componentName,
      });
    }
  };

  const handleTouchStart = (componentName) => {
    if (isEditing) {
      longPressTimer.current = setTimeout(() => {
        setContextMenu({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          componentName,
        });
      }, 3000);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const maxRows = Math.floor((window.innerHeight - 164) / 100);

  return (
    <div
      className="container mx-auto px-4 py-8 select-none min-h-screen relative"
      onContextMenu={handleContextMenu}
      style={{ paddingTop: "64px", paddingBottom: "100px" }}
    >
      <div className="absolute top-12 right-0 text-gray-700 opacity-70 px-3 pt-1 rounded-md text-sm font-semibold">
        Attention: This is a beta version. Some features may not work as
        expected.
      </div>
      {user?.isPro && (
        <div className="mb-4 flex justify-end mt-16">
          {isEditing ? (
            <>
              <button
                onClick={saveLayout}
                className="bg-green-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Save Layout
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Customize Layout
            </button>
          )}
        </div>
      )}
      {showNotification && isEditing && (
        <div className="fixed bottom-12 left-4 bg-blue-500 text-white p-4 rounded-md shadow-lg">
          <p>
            Right-click anywhere to add components. Drag to move. Resize from
            corners.
          </p>
        </div>
      )}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        compactType={null}
        preventCollision={true}
        style={{ maxHeight: "calc(100vh - 164px)" }} // Ajusta 164px a la suma de la altura de tu navbar y footer
        margin={[0, 0]} // Elimina el margen entre filas
      >
        {layout.map((item) => {
          const Component = componentMap[item.i];
          return (
            <div
              key={item.i}
              data-grid={{
                ...item,
                minW: item.i === "FavoriteGames" ? 6 : undefined,
                minH: item.i === "FavoriteGames" ? 2 : undefined,
                maxH: item.i === "FavoriteGames" ? 2 : undefined,
                maxW: item.i === "FavoriteGames" ? 12 : undefined,
                y: Math.min(item.y, maxRows - item.h), // Limita la posición y para que no supere el límite inferior
              }}
              data-grid-id={item.i}
              className="bg-gray-800 rounded-lg overflow-hidden"
              onContextMenu={(e) => handleContextMenu(e, item.i)}
              onTouchStart={() => handleTouchStart(item.i)}
              onTouchEnd={handleTouchEnd}
            >
              <div className="h-full flex flex-col">
                <motion.div className="flex-grow overflow-auto custom-scrollbar">
                  {Component && <Component isEditing={isEditing} />}
                </motion.div>
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
      {contextMenu && (
        <div
          className="fixed bg-white shadow-md rounded-md p-2 context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.isAddingComponent ? (
            <>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Add Component
              </h3>
              {Object.keys(componentMap).map((componentName) => (
                <button
                  key={componentName}
                  onClick={() => {
                    addComponent(
                      componentName,
                      contextMenu.gridX,
                      contextMenu.gridY
                    );
                    setContextMenu(null);
                  }}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-gray-800"
                >
                  {componentName}
                </button>
              ))}
            </>
          ) : (
            <button
              onClick={() => removeComponent(contextMenu.componentName)}
              className="flex items-center text-red-500 hover:bg-red-100 px-2 py-1 rounded"
            >
              <FaTrash className="mr-2" /> Remove {contextMenu.componentName}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomizableHomePage;
