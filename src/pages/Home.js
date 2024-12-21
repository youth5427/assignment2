import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios"; // axios 추가
import Banner from "../components/Banner";
import MovieRow from "../components/MovieRow";
import Header from "../components/Header";
import Footer from "../components/Footer";

// 스타일 정의
const HomeContainer = styled.div`
  background-color: #f0f0f0;
  color: black;
  min-height: 100vh;
  padding-top: 70px; /* Header 높이만큼 여유 공간 추가 */
`;

const Section = styled.section`
  margin: 20px 0;
`;

const BASE_URL = "https://api.themoviedb.org/3";

function Home() {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const userPassword = process.env.REACT_APP_API_key;

  if (!userPassword) {
    console.error("API Key (Password) not found in localStorage.");
  }

  useEffect(() => {
    const fetchFeaturedMovie = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/movie/popular`, {
          params: {
            api_key: userPassword,
            language: "ko-KR",
          },
        });
        setFeaturedMovie(response.data.results[0]);
      } catch (error) {
        console.error("Error fetching featured movie:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedMovie();
  }, [userPassword]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <HomeContainer>
      <Header />
      {featuredMovie && <Banner featuredMovie={featuredMovie} />}
      <Section>
        <MovieRow
          title="인기 영화"
          fetchUrl={`${BASE_URL}/movie/popular`}
          userPassword={userPassword}
        />
      </Section>
      <Section>
        <MovieRow
          title="최신 영화"
          fetchUrl={`${BASE_URL}/movie/now_playing`}
          userPassword={userPassword}
        />
      </Section>
      <Section>
        <MovieRow
          title="액션 영화"
          fetchUrl={`${BASE_URL}/discover/movie`}
          userPassword={userPassword}
          params={{ with_genres: 28 }}
        />
      </Section>
      <Footer />
    </HomeContainer>
  );
}

export default Home;
