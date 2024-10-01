"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import {
  FaCalendarAlt,
  FaCode,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { Card, CardMedia } from "@mui/material";
import { useChristmas } from "../../context/ChristmasContext";
import ChristmasParticles from "../ChristmasParticles";
import { Loader2 } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

export default function ChristmasGamesGrid({ isEditing }) {
  const [christmasGames, setChristmasGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isChristmasMode } = useChristmas();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const swiperRef = useRef(null);

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

  const handlePrev = (e) => {
    e.preventDefault();
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideNext();
    }
  };

  if (isLoading) {
    return <Loader2 className="animate-spin text-white mx-auto" />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const MobileGameCard = ({ game }) => (
    <Card
      sx={{
        height: "350px",
        position: "relative",
        overflow: "hidden",
        boxShadow: isChristmasMode
          ? "0 4px 8px rgba(255,0,0,0.3)"
          : "0 4px 8px rgba(227,242,253,0.3)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          boxShadow: isChristmasMode
            ? "0 8px 16px rgba(255,0,0,0.5)"
            : "0 8px 16px rgba(227,242,253,0.5)",
        },
        border: isChristmasMode ? "2px solid #ff0000" : "2px solid #e3f2fd",
        borderRadius: "12px",
        backgroundColor: isChristmasMode
          ? "rgba(0, 100, 0, 0.8)"
          : "rgba(10, 35, 66, 0.8)",
      }}
    >
      <CardMedia
        component="img"
        image={game.coverImageUrl}
        alt={game.name}
        sx={{
          width: "100%",
          height: "70%",
          objectFit: "cover",
        }}
      />
      <Box
        sx={{
          padding: "16px",
          height: "30%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontSize: "1rem",
            fontWeight: "bold",
            color: isChristmasMode ? "#ff0000" : "#e3f2fd",
          }}
        >
          {game.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FaCalendarAlt
            style={{ marginRight: "4px", fontSize: "0.8rem", color: "#ff9900" }}
          />
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem", color: "#ff9900" }}
          >
            {new Date(game.releaseDate).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  const DesktopGameSlide = ({ game }) => (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "520px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        boxShadow: isChristmasMode
          ? "0 4px 10px rgba(255,0,0,0.3)"
          : "0 4px 10px rgba(0,0,0,0.3)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "420px",
          backgroundImage: `url(${game.coverImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Box
        sx={{
          width: "100%",
          height: "100px",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: isChristmasMode
            ? "rgba(0, 100, 0, 0.8)"
            : "rgba(0, 0, 0, 0.7)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              color: isChristmasMode ? "#ff0000" : "#3498db",
              marginBottom: "0.5rem",
            }}
          >
            {game.name}
          </Typography>
        </motion.div>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FaCalendarAlt
                style={{ color: "#ff9900", marginRight: "0.5rem" }}
              />
              <Typography variant="body1" sx={{ color: "#ff9900" }}>
                {new Date(game.releaseDate).toLocaleDateString()}
              </Typography>
            </Box>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FaCode style={{ color: "#ff9900", marginRight: "0.5rem" }} />
              <Typography variant="body1" sx={{ color: "#ff9900" }}>
                {game.developer}
              </Typography>
            </Box>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FaBuilding style={{ color: "#ff9900", marginRight: "0.5rem" }} />
              <Typography variant="body1" sx={{ color: "#ff9900" }}>
                {game.publisher}
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );

  return (
    <div className="relative flex flex-col">
      {isChristmasMode && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
          }}
        >
          <ChristmasParticles />
        </div>
      )}
      {isEditing && <div className="absolute inset-0 bg-transparent z-10" />}
      <Typography
        variant="h4"
        component="h2"
        sx={{
          color: isChristmasMode ? "#ff0000" : "white",
          marginBottom: "0.5rem",
          textAlign: "center",
        }}
      >
        🎄 Merry Christmas! ⛄
      </Typography>
      <Typography
        variant="h6"
        component="h3"
        sx={{ color: "#ff9900", textAlign: "center", marginBottom: "1rem" }}
      >
        Check out our festive selection of games 🎁
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isMobile ? (
          <Box sx={{ padding: "16px", width: "100%" }}>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              autoplay={{
                delay: 10000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
            >
              {christmasGames.map((game) => (
                <SwiperSlide key={game.slug}>
                  <Link
                    href={`/games/${game.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <MobileGameCard game={game} />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        ) : (
          <Box
            sx={{
              padding: "16px",
              position: "relative",
              width: "100%",
              maxWidth: "1000px",
            }}
          >
            <Swiper
              ref={swiperRef}
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              autoplay={{
                delay: 10000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination",
                bulletClass: "swiper-pagination-bullet",
                bulletActiveClass: "swiper-pagination-bullet-active",
              }}
              style={{ height: "560px", borderRadius: "20px" }}
            >
              {christmasGames.map((game) => (
                <SwiperSlide key={game.slug}>
                  <Link
                    href={`/games/${game.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <DesktopGameSlide game={game} />
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
            <Box
              onClick={handlePrev}
              sx={{
                position: "absolute",
                top: "50%",
                left: "-50px",
                transform: "translateY(-50%)",
                color: isChristmasMode ? "#ff0000" : "#3498db",
                fontSize: "2rem",
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              <FaChevronLeft />
            </Box>
            <Box
              onClick={handleNext}
              sx={{
                position: "absolute",
                top: "50%",
                right: "-50px",
                transform: "translateY(-50%)",
                color: isChristmasMode ? "#ff0000" : "#3498db",
                fontSize: "2rem",
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              <FaChevronRight />
            </Box>
          </Box>
        )}
      </Box>
      <div className="swiper-pagination"></div>
    </div>
  );
}
