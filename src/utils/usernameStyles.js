export const getUsernameStyle = (effect, color, intensity = 1) => {
  let style = { color: color || "inherit" };

  switch (effect) {
    case "glow":
      style.textShadow = `0 0 ${5 * intensity}px #fff, 0 0 ${
        10 * intensity
      }px #fff, 0 0 ${15 * intensity}px #fff`;
      break;
    case "shadow":
      style.textShadow = `${2 * intensity}px ${2 * intensity}px ${
        4 * intensity
      }px rgba(0,0,0,0.5)`;
      break;
    case "neon":
      style.textShadow = `0 0 ${5 * intensity}px #fff, 0 0 ${
        10 * intensity
      }px #fff, 0 0 ${15 * intensity}px #fff, 0 0 ${
        20 * intensity
      }px ${color}, 0 0 ${35 * intensity}px ${color}, 0 0 ${
        40 * intensity
      }px ${color}, 0 0 ${50 * intensity}px ${color}, 0 0 ${
        75 * intensity
      }px ${color}`;
      break;
    case "outline":
      style.textShadow = `${-1 * intensity}px ${-1 * intensity}px 0 #000, ${
        1 * intensity
      }px ${-1 * intensity}px 0 #000, ${-1 * intensity}px ${
        1 * intensity
      }px 0 #000, ${1 * intensity}px ${1 * intensity}px 0 #000`;
      break;
    case "retro":
      style.textShadow = `${3 * intensity}px ${3 * intensity}px 0 #1a1a1a, ${
        6 * intensity
      }px ${6 * intensity}px 0 #2a2a2a`;
      break;
    default:
      break;
  }

  return style;
};
