"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardMedia, Typography, Box } from "@mui/material";
import { FaCalendarAlt, FaCode, FaBuilding } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";

export default function HalloweenGamesGrid({ isEditing }) {
  const [halloweenGames, setHalloweenGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lista de slugs de juegos de Halloween
  const halloweenGameSlugs = [
    "resident-evil-village",
    "phasmophobia",
    "outlast",
    "martha-is-dead",
    "dead-by-daylight",
    "visage",
  ];

  useEffect(() => {
    const fetchHalloweenGames = async () => {
      setIsLoading(true);
      try {
        const gamesPromises = halloweenGameSlugs.map((slug) =>
          fetch(`https://api.gameboxd.me/api/game/${slug}`, {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }).then((res) => res.json())
        );

        const gamesData = await Promise.all(gamesPromises);
        setHalloweenGames(gamesData);
      } catch (error) {
        console.error("Error fetching Halloween games:", error);
        setError(
          "Failed to fetch Halloween games, please refresh the page or try again later"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHalloweenGames();
  }, []);

  if (isLoading) {
    return (
      <Typography variant="body1" align="center" color="textPrimary">
        <CircularProgress />
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="body1" align="center" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <div className="relative">
      {isEditing && <div className="absolute inset-0 bg-transparent z-10" />}
      <Box
        sx={{
          padding: "2rem",
          borderRadius: "1rem",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography variant="h4" component="h2" sx={{ color: "#ff6600", textAlign: "center", marginBottom: "1rem" }}>
          🎃 Halloween is here! 👻
        </Typography>
        <Typography variant="h6" component="h3" sx={{ color: "#ff9900", textAlign: "center", marginBottom: "2rem" }}>
          Check out our spooky selection of games 🕷️
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 3,
          }}
        >
          {halloweenGames.map((game) => (
            <Link
              href={`/games/${game.slug}`}
              key={game.slug}
              style={{ textDecoration: "none" }}
            >
              <Card
                sx={{
                  height: "300px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 4px 8px rgba(255,102,0,0.3)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 8px 16px rgba(255,102,0,0.5)",
                  },
                  border: "2px solid #ff6600",
                  borderRadius: "12px",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                }}
              >
                <CardMedia
                  component="img"
                  image={game.coverImageUrl}
                  alt={game.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "all 0.3s ease-in-out",
                    ".MuiCard-root:hover &": {
                      transform: "scale(1.05)",
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
                    color: "white",
                    padding: "16px",
                    transition: "all 0.3s ease-in-out",
                    opacity: 0,
                    ".MuiCard-root:hover &": {
                      opacity: 1,
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      marginBottom: "8px",
                      textAlign: "center",
                      fontSize: "1rem",
                      color: "#ff6600",
                    }}
                  >
                    {game.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                    <FaCalendarAlt style={{ marginRight: "4px", fontSize: "0.8rem", color: "#ff9900" }} />
                    <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#ff9900" }}>
                      {new Date(game.releaseDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                    <FaCode style={{ marginRight: "4px", fontSize: "0.8rem", color: "#ff9900" }} />
                    <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#ff9900" }}>
                      {game.developer}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FaBuilding style={{ marginRight: "4px", fontSize: "0.8rem", color: "#ff9900" }} />
                    <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#ff9900" }}>
                      {game.publisher}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Link>
          ))}
        </Box>
      </Box>
    </div>
  );
}