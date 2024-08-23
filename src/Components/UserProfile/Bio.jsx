const Bio = ({ bio, setBio, editing }) => (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold mb-2">Bio</h2>
      <p className="text-lg">{bio || "No bio available."}</p>
      {editing && (
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="p-2 border rounded w-full"
        />
      )}
    </div>
  );
  
  export default Bio;