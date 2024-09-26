import Link from "next/link";
import { getUsernameStyle } from "../../utils/usernameStyles";

const StyledUsername = ({ user, style, isPro }) => {
  if (!user) return null; // o algún contenido por defecto

  return (
    <span style={style} className={`font-bold ${isPro ? "text-gold" : ""}`}>
      {user.username}
    </span>
  );
};

export default StyledUsername;
