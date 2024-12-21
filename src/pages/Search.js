import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // URL에서 query 파라미터 읽기
import styled from "styled-components";
import axios from "axios";
import Header from "../components/Header";
import TableView from "../components/TableView";
import InfinityScrollView from "../components/InfinityScrollView";
import Footer from "../components/Footer";

const PageContainer = styled.div`
  margin-top: 100px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FilterContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  border-radius: 5px;
  background-color: #ffebcd;
  padding: 5px 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
  height: ${(props) => (props.isMobile ? "60px" : "30px")}; /* 높이 변경 */
`;

const ResetButton = styled.button`
  height: ${(props) => (props.isMobile ? "60px" : "30px")}; /* 높이 변경 */

  border: none;
  border-radius: 5px;
  background-color: #ff6b6b;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: #ff3b3b;
  }

  &:focus {
    outline: none;
  }
`;

const ViewToggleContainer = styled.div`
  position: fixed;
  top: 110px;
  margin-left: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 1;
`;

const ToggleButton = styled.button`
  height: 40px;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => (props.active ? "#007bff" : "#f0f0f0")};
  color: ${(props) => (props.active ? "white" : "black")};
  cursor: pointer;
  font-size: 0.9rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
  &:hover {
    background-color: ${(props) => (props.active ? "#0056b3" : "#e0e0e0")};
  }

  &:focus {
    outline: none;
  }
`;
function Search() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("infinity");
  const userPassword = process.env.REACT_APP_API_key;
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // 모바일 여부 판단

  const [searchParams] = useSearchParams(); // URL에서 쿼리 파라미터 가져오기
  const searchQuery = searchParams.get("query") || ""; // query 파라미터 값

  // 추가된 useEffect: 화면 크기 변경 시 isMobile 상태 업데이트
  useEffect(() => {
    // 윈도우 크기 변경 이벤트 추가
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          "https://api.themoviedb.org/3/genre/movie/list",
          {
            params: { api_key: userPassword, language: "ko-KR" },
          }
        );
        setGenres(response.data.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, [userPassword]);

  const fetchMoviesForTable = async (page) => {
    try {
      const minRating = selectedRating ? parseFloat(selectedRating) : undefined;
      const maxRating = minRating !== undefined ? minRating + 0.9 : undefined;

      const response = await axios.get(
        searchQuery
          ? "https://api.themoviedb.org/3/search/movie" // 검색어가 있을 때
          : "https://api.themoviedb.org/3/discover/movie", // 검색어가 없을 때
        {
          params: {
            api_key: userPassword,
            language: "ko-KR",
            page,
            query: searchQuery || undefined, // 검색어 추가
            with_genres: selectedGenre || undefined, // 선택된 장르
            "vote_average.gte": minRating, // 최소 평점
            "vote_average.lte": maxRating, // 최대 평점
            sort_by: sortOrder || "popularity.desc", // 정렬 기준
          },
        }
      );
      setMovies(response.data.results);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const fetchMoviesForInfinity = async () => {
    if (loading || currentPage > totalPages) return;

    setLoading(true);

    try {
      const minRating = selectedRating ? parseFloat(selectedRating) : undefined;
      const maxRating = minRating !== undefined ? minRating + 0.9 : undefined;

      const response = await axios.get(
        searchQuery
          ? "https://api.themoviedb.org/3/search/movie" // 검색어가 있을 때
          : "https://api.themoviedb.org/3/discover/movie", // 검색어가 없을 때
        {
          params: {
            api_key: userPassword,
            language: "ko-KR",
            page: currentPage,
            query: searchQuery || undefined, // 검색어 추가
            with_genres: selectedGenre || undefined, // 선택된 장르
            "vote_average.gte": minRating, // 최소 평점
            "vote_average.lte": maxRating, // 최대 평점
            sort_by: sortOrder || "popularity.desc", // 정렬 기준
          },
        }
      );

      setMovies((prevMovies) => [
        ...prevMovies.filter(
          (movie) =>
            !response.data.results.find((newMovie) => newMovie.id === movie.id)
        ),
        ...response.data.results,
      ]);

      setTotalPages(response.data.total_pages);
      setCurrentPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // 검색어 및 필터 변경 시 데이터 새로 요청
  useEffect(() => {
    setMovies([]);
    setCurrentPage(1);
    if (viewMode === "infinity") {
      fetchMoviesForInfinity();
    } else {
      fetchMoviesForTable(1);
    }
  }, [viewMode, selectedGenre, selectedRating, sortOrder, searchQuery]);

  const handleResetFilters = () => {
    if (window.confirm("필터가 초기화 됩니다.")) {
      setSelectedGenre("");
      setSelectedRating("");
      setSortOrder("");
      setCurrentPage(1);
      window.scrollTo({ top: 0, behavior: "smooth" }); // 상단으로 스크롤
    }
  };

  return (
    <PageContainer>
      <Header />
      <h1></h1>
      <ViewToggleContainer>
        {/** 검색어가 없을 때만 필터 컨테이너 표시 */}
        {!searchQuery && (
          <FilterContainer isMobile={isMobile}>
            <div>
              <label htmlFor="genre-select">장르 선택: </label>
              <select
                id="genre-select"
                value={selectedGenre}
                onChange={(e) => {
                  setSelectedGenre(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">전체</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rating-select">평점 선택: </label>
              <select
                id="rating-select"
                value={selectedRating}
                onChange={(e) => {
                  setSelectedRating(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">전체</option>
                {[...Array(10)].map((_, i) => {
                  const rating = 10 - i;
                  return (
                    <option key={rating} value={rating}>
                      {rating}점대
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label htmlFor="sort-select">정렬 기준: </label>
              <select
                id="sort-select"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">기본(인기순)</option>
                <option value="vote_average.desc">평점 높은 순</option>
                <option value="vote_average.asc">평점 낮은 순</option>
                <option value="release_date.desc">최신 출시일</option>
                <option value="release_date.asc">오래된 출시일</option>
              </select>
            </div>
            <ResetButton onClick={handleResetFilters} isMobile={isMobile}>
              초기화
            </ResetButton>
          </FilterContainer>
        )}
        {!isMobile && (
          <>
            <ToggleButton
              active={viewMode === "table"}
              onClick={() => setViewMode("table")}
            >
              Table View
            </ToggleButton>
            <ToggleButton
              active={viewMode === "infinity"}
              onClick={() => {
                setCurrentPage(1);
                setViewMode("infinity");
              }}
            >
              Infinity Scroll
            </ToggleButton>
          </>
        )}
      </ViewToggleContainer>
      {viewMode === "table" ? (
        <TableView
          movies={movies}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            fetchMoviesForTable(page);
          }}
        />
      ) : (
        <InfinityScrollView
          fetchMovies={() => fetchMoviesForInfinity()}
          movies={movies}
          loading={loading}
        />
      )}
      <Footer />
    </PageContainer>
  );
}

export default Search;
