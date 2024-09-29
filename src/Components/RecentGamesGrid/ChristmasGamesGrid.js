"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardMedia, Typography, Box } from "@mui/material";
import { FaCalendarAlt, FaCode, FaBuilding } from "react-icons/fa";
import CircularProgress from "@mui/material/CircularProgress";

export default function ChristmasGamesGrid({ isEditing }) {
  const [christmasGames, setChristmasGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lista de slugs de juegos navideños
  const christmasGameSlugs = [
    "marvels-spider-man-miles-morales",
    "dead-rising-4",
    "tom-clancys-the-division",
    "batman-arkham-origins",
    "saints-row-iv",
    "rise-of-the-tomb-raider",
  ];

  useEffect(() => {
    const fetchChristmasGames = async () => {
      setIsLoading(true);
      try {
        const gamesPromises = christmasGameSlugs.map((slug) =>
          fetch(`https://api.gameboxd.me/api/game/${slug}`, {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }).then((res) => res.json())
        );

        const gamesData = await Promise.all(gamesPromises);
        setChristmasGames(gamesData);
      } catch (error) {
        console.error("Error fetching Christmas games:", error);
        setError(
          "Failed to fetch Christmas games, please refresh the page or try again later"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchChristmasGames();
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
          padding: "1rem",
          borderRadius: "1rem",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ color: "#e3f2fd", textAlign: "center", marginBottom: "1rem" }}
        >
          🎄 Merry Christmas! ⛄
        </Typography>
        <Typography
          variant="h6"
          component="h3"
          sx={{ color: "#ff9900", textAlign: "center", marginBottom: "2rem" }}
        >
          Check out our festive selection of games 🎁
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 3,
          }}
        >
          {christmasGames.map((game) => (
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
                  boxShadow: "0 4px 8px rgba(227,242,253,0.3)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 8px 16px rgba(227,242,253,0.5)",
                  },
                  border: "2px solid #e3f2fd",
                  borderRadius: "12px",
                  backgroundColor: "rgba(10, 35, 66, 0.8)",
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
                    background:
                      "linear-gradient(to top, rgba(10,35,66,0.9) 0%, rgba(10,35,66,0) 100%)",
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
                      color: "#e3f2fd",
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
                      style={{
                        marginRight: "4px",
                        fontSize: "0.8rem",
                        color: "#ff9900",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.8rem", color: "#ff9900" }}
                    >
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
                    <FaCode
                      style={{
                        marginRight: "4px",
                        fontSize: "0.8rem",
                        color: "#ff9900",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.8rem", color: "#ff9900" }}
                    >
                      {game.developer}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FaBuilding
                      style={{
                        marginRight: "4px",
                        fontSize: "0.8rem",
                        color: "#ff9900",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.8rem", color: "#ff9900" }}
                    >
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
