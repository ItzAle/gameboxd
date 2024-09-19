import React from "react";
import Link from "next/link";
import ProBadge from "./ProBadge";

const StyledUsername = ({ user, style, isPro }) => {
  return (
    <Link href={`/profile/${user.id}`}>
      <span className="flex items-center cursor-pointer">
        <span style={style}>{user.username}</span>
        {isPro && <ProBadge className="ml-2 text-xs" />}
      </span>
    </Link>
  );
};

export default StyledUsername;
