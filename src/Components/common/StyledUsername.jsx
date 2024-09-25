import Link from 'next/link';
import { getUsernameStyle } from '../../utils/usernameStyles';

const StyledUsername = ({ username, userId, nameColor, nameEffect }) => {
  return (
    <Link href={`/profile/${userId}`}>
      <span
        style={{
          color: nameColor || 'inherit',
          ...getUsernameStyle(nameEffect)
        }}
      >
        {username}
      </span>
    </Link>
  );
};

export default StyledUsername;
