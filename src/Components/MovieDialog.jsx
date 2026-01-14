// MovieDialog.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

function MovieDialog({ movie, onClose, isOpen }) {
  if (!movie) return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const dialogVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 30,
      transition: {
        duration: 0.3,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="dialog-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <motion.div
            className="dialog-container"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              display: "flex",
              maxWidth: "1000px",
              width: "100%",
              maxHeight: "90vh",
              backgroundColor: "#1a1a1a",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Close Button */}
            <motion.button
              className="close-button"
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.1)")
              }
            >
              ×
            </motion.button>

            {/* Poster Image Section */}
            <motion.div
              className="poster-section"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              style={{
                flex: "0 0 350px",
                minHeight: "500px",
                background: `url(${movie.posterUrl}) center/cover no-repeat`,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "100px",
                  background: "linear-gradient(to top, #1a1a1a, transparent)",
                }}
              />
            </motion.div>

            {/* Content Section */}
            <motion.div
              className="content-section"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              style={{
                flex: 1,
                padding: "40px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {/* Title */}
              <motion.h1
                variants={itemVariants}
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#ffffff",
                  lineHeight: "1.2",
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                {movie.title}
              </motion.h1>

              {/* Rating and Meta Info */}
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                {movie.rating && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      backgroundColor: "rgba(255, 193, 7, 0.15)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 193, 7, 0.3)",
                    }}
                  >
                    <span style={{ color: "#ffc107", fontSize: "18px" }}>
                      ★
                    </span>
                    <span
                      style={{
                        color: "#ffc107",
                        fontWeight: "600",
                        fontSize: "16px",
                      }}
                    >
                      {movie.rating.toFixed(1)}
                    </span>
                  </div>
                )}

                {movie.releaseDate && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      color: "#9ca3af",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {new Date(movie.releaseDate).getFullYear()}
                  </motion.div>
                )}

                {movie.runtime && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      color: "#9ca3af",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {movie.runtime} min
                  </motion.div>
                )}
              </motion.div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {movie.genres.map((genre, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "20px",
                        color: "#60a5fa",
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "default",
                      }}
                    >
                      {genre}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              {/* Overview Section */}
              <motion.div
                variants={itemVariants}
                style={{
                  marginTop: "8px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#e5e7eb",
                    fontFamily:
                      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                >
                  Overview
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: "1.7",
                    color: "#9ca3af",
                    fontFamily:
                      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                >
                  {movie.overview || "No overview available."}
                </p>
              </motion.div>

              {/* Additional Info */}
              {(movie.director || movie.cast) && (
                <motion.div
                  variants={itemVariants}
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {movie.director && (
                    <div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#6b7280",
                          marginRight: "8px",
                        }}
                      >
                        Director:
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#d1d5db",
                        }}
                      >
                        {movie.director}
                      </span>
                    </div>
                  )}

                  {movie.cast && movie.cast.length > 0 && (
                    <div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#6b7280",
                          marginRight: "8px",
                        }}
                      >
                        Cast:
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#d1d5db",
                        }}
                      >
                        {movie.cast.slice(0, 5).join(", ")}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "auto",
                  paddingTop: "20px",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily:
                      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                >
                  Watch Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily:
                      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                >
                  Add to List
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MovieDialog;
