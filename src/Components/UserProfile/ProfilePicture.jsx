import Image from "next/image";
import defaultProfilePicture from "../../utils/default-image.png";

const ProfilePicture = ({ profilePicture }) => (
  <div className="mb-4 flex flex-col items-center">
    <Image
      src={profilePicture || defaultProfilePicture}
      alt="Profile Picture"
      width={128}
      height={128}
      className="object-cover rounded-full shadow-lg"
    />
  </div>
);

export default ProfilePicture;
