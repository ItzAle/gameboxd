export const getUsernameStyle = (effect, color) => {
  let style = { color: color || 'inherit' };

  switch (effect) {
    case "glow":
      style.textShadow = "0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff";
      break;
    case "shadow":
      style.textShadow = "2px 2px 4px rgba(0,0,0,0.5)";
      break;
    case "neon":
      style.textShadow = "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #ff00de, 0 0 35px #ff00de, 0 0 40px #ff00de, 0 0 50px #ff00de, 0 0 75px #ff00de";
      break;
    default:
      break;
  }

  return style;
};
