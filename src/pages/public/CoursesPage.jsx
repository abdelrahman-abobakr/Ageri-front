import React, { useEffect, useState } from "react";
import axios from "axios";

const PAGE_SIZE = 10;

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const fetchCourses = async (pageNum = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `http://localhost:8000/api/training/api/courses/?page=${pageNum}`
      );
      setCourses(res.data.results || []);
      setCount(res.data.count || 0);
      setNext(res.data.next);
      setPrevious(res.data.previous);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to load courses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(page);
    // eslint-disable-next-line
  }, [page]);

  const handleNext = () => {
    if (next) setPage((p) => p + 1);
  };
  const handlePrev = () => {
    if (previous && page > 1) setPage((p) => p - 1);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: 32 }}>Courses</h1>
      {loading && <div style={{ textAlign: "center" }}>Loading...</div>}
      {error && (
        <div
          style={{ color: "#e53e3e", textAlign: "center", marginBottom: 16 }}
        >
          {error}
        </div>
      )}
      {!loading && !error && courses.length === 0 && (
        <div style={{ textAlign: "center" }}>No courses found.</div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {courses.map((course) => (
          <div
            key={course.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              minHeight: 260,
              position: "relative",
            }}
          >
            {course.featured_image && (
              <img
                src={course.featured_image}
                alt={course.title}
                style={{
                  width: "100%",
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <h2 style={{ fontSize: 22, margin: "0 0 8px 0", color: "#2c3e50" }}>
              {course.title}
            </h2>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>
              {course.course_code} | {course.training_type}
            </div>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>
              {course.short_description}
            </div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Instructor: <b>{course.instructor_name || "-"}</b> | Department:{" "}
              <b>{course.department_name || "-"}</b>
            </div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Start: {course.start_date} | End: {course.end_date}
            </div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Credits: {course.credits} | Duration: {course.duration_hours}h
            </div>
            <div
              style={{
                fontSize: 14,
                color: course.is_free ? "#38a169" : "#e53e3e",
                marginBottom: 8,
              }}
            >
              {course.is_free ? "Free" : `Price: ${course.price}`}
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>
              Status: {course.status} | Enrollment: {course.current_enrollment}{" "}
              / {course.max_participants}
            </div>
            {course.is_featured && (
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "#4299e1",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "2px 10px",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                Featured
              </span>
            )}
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 32,
          gap: 16,
        }}
      >
        <button
          onClick={handlePrev}
          disabled={!previous || page === 1 || loading}
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            border: "1px solid #eee",
            background: previous && page > 1 ? "#f7fafc" : "#e2e8f0",
            color: "#2c3e50",
            cursor: previous && page > 1 ? "pointer" : "not-allowed",
          }}
        >
          Previous
        </button>
        <span style={{ alignSelf: "center", fontWeight: 500 }}>
          Page {page} / {Math.ceil(count / PAGE_SIZE) || 1}
        </span>
        <button
          onClick={handleNext}
          disabled={!next || loading}
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            border: "1px solid #eee",
            background: next ? "#f7fafc" : "#e2e8f0",
            color: "#2c3e50",
            cursor: next ? "pointer" : "not-allowed",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CoursesPage;
