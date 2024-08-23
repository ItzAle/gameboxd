const ProfilePicture = ({ profilePicture }) => (
    <div className="mb-4 flex flex-col items-center">
      <img
        src={profilePicture || "/path/to/default-profile-pic.png"}
        alt="Profile Picture"
        className="w-32 h-32 object-cover rounded-full shadow-lg"
      />
    </div>
  );
  
  export default ProfilePicture;