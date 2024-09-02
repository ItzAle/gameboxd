const Bio = ({ bio, setBio, editing }) => (
  <div className="mb-4">
    <h2 className="text-2xl font-semibold mb-2">Bio</h2>
    <p className="text-lg">{bio || "No bio available."}</p>
  </div>
);

export default Bio;
