import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Asegúrate de importar useAuth

const ProOptionsModal = ({ isOpen, onClose, userProfile, onUpdate }) => {
  const [nameEffect, setNameEffect] = useState(userProfile.nameEffect || '');
  const [nameColor, setNameColor] = useState(userProfile.nameColor || '');
  const { user } = useAuth(); // Obtenemos el usuario actual

  const handleSave = async () => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        nameEffect,
        nameColor,
      });
      toast.success("PRO options updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating PRO options:", error);
      toast.error(`Failed to update PRO options: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 max-w-[90%]"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">PRO Options</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name Effect</label>
            <select
              value={nameEffect}
              onChange={(e) => setNameEffect(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-700 text-white"
            >
              <option value="">None</option>
              <option value="glow">Glow</option>
              <option value="shadow">Shadow</option>
              <option value="neon">Neon</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Name Color</label>
            <input
              type="color"
              value={nameColor}
              onChange={(e) => setNameColor(e.target.value)}
              className="mt-1 block w-full h-10 rounded-md"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProOptionsModal;
