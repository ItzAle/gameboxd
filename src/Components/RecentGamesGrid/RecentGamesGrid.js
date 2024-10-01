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
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { Card, CardMedia } from "@mui/material";
import { Loader2 } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function RecentGamesGrid({ isEditing }) {
  const [recentGames, setRecentGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const swiperRef = useRef(null);

  useEffect(() => {
    const fetchRecentGames = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.gameboxd.me/api/games/upcoming`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );
        if (!response.ok) {
          throw new Error(
            "Failed to fetch recent games, please, refresh the page or try again later"
          );
        }
        const data = await response.json();

        // Ordenar los juegos por fecha de lanzamiento más cercana
        const sortedGames = data.sort((a, b) => {
          const dateA = new Date(a.releaseDate);
          const dateB = new Date(b.releaseDate);
          const today = new Date();
          return Math.abs(dateA - today) - Math.abs(dateB - today);
        });

        // Tomar los 10 juegos más cercanos
        setRecentGames(sortedGames.slice(0, 10));
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchRecentGames();
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
        height: { xs: "350px", sm: "350px" },
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          transform: isMobile ? "none" : "translateY(-5px)",
        },
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
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
          height: isMobile ? "70%" : "100%",
          objectFit: "cover",
        }}
      />
      {isMobile && (
        <Box
          sx={{
            padding: "25px",
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
              color: "white",
              marginBottom: "4px",
            }}
          >
            {game.name}
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
          >
            <FaCalendarAlt
              style={{
                marginRight: "4px",
                fontSize: "0.8rem",
                color: "#3498db",
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontSize: "0.8rem", color: "#3498db" }}
            >
              {new Date(game.releaseDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FaCode
              style={{
                marginRight: "4px",
                fontSize: "0.8rem",
                color: "#3498db",
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontSize: "0.8rem", color: "#3498db" }}
            >
              {game.developer}
            </Typography>
          </Box>
        </Box>
      )}
      {!isMobile && (
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
            transition: "opacity 0.3s ease-in-out",
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              marginBottom: { xs: "4px", sm: "8px" },
              textAlign: "center",
              fontSize: { xs: "0.9rem", sm: "1rem" },
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
            <FaCalendarAlt style={{ marginRight: "4px", fontSize: "0.8rem" }} />
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
            <FaBuilding style={{ marginRight: "4px", fontSize: "0.8rem" }} />
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {game.publisher}
            </Typography>
          </Box>
        </Box>
      )}
    </Card>
  );

  const DesktopGameSlide = ({ game }) => (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "520px", // Reducimos aún más la altura total
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: "20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "420px", // Reducimos la altura de la imagen
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
          backgroundColor: "rgba(0, 0, 0, 0.7)",
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
            sx={{ color: "#3498db", marginBottom: "0.5rem" }}
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
                style={{ color: "#3498db", marginRight: "0.5rem" }}
              />
              <Typography variant="body1" sx={{ color: "#3498db" }}>
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
              <FaCode style={{ color: "#3498db", marginRight: "0.5rem" }} />
              <Typography variant="body1" sx={{ color: "#3498db" }}>
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
              <FaBuilding style={{ color: "#3498db", marginRight: "0.5rem" }} />
              <Typography variant="body1" sx={{ color: "#3498db" }}>
                {game.publisher}
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );

  return (
    <div className="relative">
      {isEditing && <div className="absolute inset-0 bg-transparent z-10" />}
      <Typography
        variant="h4"
        component="h2"
        sx={{ color: "white", marginBottom: "1rem", textAlign: "center" }}
      >
        Upcoming Games
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
            {recentGames.map((game) => (
              <SwiperSlide key={game.id}>
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
              modules={[Autoplay, Pagination]}
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
              {recentGames.map((game) => (
                <SwiperSlide key={game.id}>
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
                color: "#3498db",
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
                color: "#3498db",
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
