"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardMedia, Typography, Box } from "@mui/material";
import { FaCalendarAlt, FaCode, FaBuilding } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";

export default function RecentGamesGrid({ isEditing }) {
  const [recentGames, setRecentGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentGames = async () => {
      setIsLoading(true);
      const currentYear = new Date().getFullYear();
      try {
        const response = await fetch(
          `https://api.gameboxd.me/api/games/upcoming`
        );
        if (!response.ok) {
          throw new Error(
            "Failed to fetch recent games, please, refresh the page or try again later"
          );
        }
        const data = await response.json();

        const sortedGames = data.sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );

        const latestGames = sortedGames.slice(0, 6);

        setRecentGames(latestGames);
      } catch (error) {
        console.error("Error fetching recent games:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentGames();
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 2,
        }}
      >
        {recentGames.map((game) => (
          <Link
            href={`/games/${game.slug}`}
            key={game.id}
            style={{ textDecoration: "none" }}
          >
            <Card
              sx={{
                height: "260px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transition:
                  "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out",
                "&:hover": {
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                  transform: "translateY(-5px)",
                },
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
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
                  transition: "filter 0.3s ease-in-out",
                  ".MuiCard-root:hover &": {
                    filter: "blur(5px)",
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
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  padding: "16px",
                  opacity: 0,
                  transform: "translateZ(-50px)",
                  transition: "all 0.3s ease-in-out",
                  ".MuiCard-root:hover &": {
                    opacity: 1,
                    transform: "translateZ(0)",
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
                  }}
                >
                  {game.name}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <FaCalendarAlt
                    style={{ marginRight: "4px", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {new Date(game.releaseDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <FaCode style={{ marginRight: "4px", fontSize: "0.8rem" }} />
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {game.developer}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FaBuilding
                    style={{ marginRight: "4px", fontSize: "0.8rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {game.publisher}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Link>
        ))}
      </Box>
    </div>
  );
}
