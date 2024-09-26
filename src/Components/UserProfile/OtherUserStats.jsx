import React from "react";
import { FaGamepad, FaStar, FaListUl } from "react-icons/fa";

export default function OtherUserStats({ userProfile }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-semibold">Reviews</h3>
        </div>
        <p className="text-2xl font-bold">{userProfile.reviewsCount || 0}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-semibold">Games Played</h3>
        </div>
        <p className="text-2xl font-bold">{userProfile.library?.length || 0}</p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-semibold">Collections</h3>
        </div>
        <p className="text-2xl font-bold">
          {userProfile.collectionsCount || 0}
        </p>
      </div>
    </div>
  );
}
