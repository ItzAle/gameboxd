import ProfilePage from "./client.page";

export const metadata = {
  title: "Profile",
  description:
    "Profile page of the user, where you can see your own games and your own profile.",
};

export default function Profile() {
  return (
    <div>
      <ProfilePage />
    </div>
  );
}
