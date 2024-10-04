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
import { Loader2 } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

export default function HalloweenGamesGrid({ isEditing }) {
  const [halloweenGames, setHalloweenGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const swiperRef = useRef(null);

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
        setError(
          "Failed to fetch Halloween games, please refresh the page or try again later"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHalloweenGames();
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

  const MobileGameCard = ({ game }) => (
    <Card
      sx={{
        height: "350px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(255,102,0,0.3)",
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(255,102,0,0.5)",
        },
        border: "1px solid rgba(255, 102, 0, 0.3)",
        borderRadius: "12px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        flexDirection: "column",
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
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          flexGrow: 1,
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
            color: "#ff6600",
            marginBottom: "4px",
          }}
        >
          {game.name}
        </Typography>
        <Box
          sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
        >
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FaCode
            style={{ marginRight: "4px", fontSize: "0.8rem", color: "#ff9900" }}
          />
          <Typography
            variant="body2"
            sx={{ fontSize: "0.8rem", color: "#ff9900" }}
          >
            {game.developer}
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  const HalloweenGameSlide = ({ game }) => (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "520px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        boxShadow: "0 4px 10px rgba(255,102,0,0.5)",
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
          backgroundColor: "rgba(0, 0, 0, 0.8)",
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
            sx={{ color: "#ff6600", marginBottom: "0.5rem" }}
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

  if (isLoading) {
    return (
      <Typography variant="body1" align="center" color="textPrimary">
        <Loader2 className="animate-spin text-white mx-auto" />
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
    <div className="relative pt-12">
      {isEditing && <div className="absolute inset-0 bg-transparent z-10" />}
      <Typography
        variant="h4"
        component="h2"
        sx={{ color: "#ff6600", marginBottom: "1rem", textAlign: "center" }}
      >
        🎃 Halloween is here! 👻
      </Typography>
      <Typography
        variant="h6"
        component="h3"
        sx={{ color: "#ff9900", textAlign: "center", marginBottom: "2rem" }}
      >
        Check out our spooky selection of games 🕷️
      </Typography>
      {isMobile ? (
        <Box sx={{ padding: "16px" }}>
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
            {halloweenGames.map((game) => (
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
        <Box sx={{ padding: "16px", position: "relative" }}>
          <Box sx={{ position: "relative" }}>
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
              {halloweenGames.map((game) => (
                <SwiperSlide key={game.slug}>
                  <Link
                    href={`/games/${game.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <HalloweenGameSlide game={game} />
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
                color: "#ff6600",
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
                color: "#ff6600",
                fontSize: "2rem",
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              <FaChevronRight />
            </Box>
          </Box>
          <div className="swiper-pagination"></div>
        </Box>
      )}
    </div>
  );
}
