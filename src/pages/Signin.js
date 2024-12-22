import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Footer from "../components/FooterSignin";

// 스타일 정의
// 로그인 페이지의 배경 스타일 정의
const Background = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url(${process.env.PUBLIC_URL}/Signin_background.jpg);
  background-size: cover;
  background-position: center;
`;

// 로그인 박스 컨테이너 스타일 정의
const Container = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.85); // 약간 투명한 배경
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

// 로그인 버튼 스타일 정의
const Button = styled.button`
  padding: 0.75rem;
  font-size: 1rem;
  background-color: #fee500; // 카카오의 대표 색상
  color: black;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;

  &:hover {
    background-color: #ffd600; // 마우스 오버 시 더 어두운 색
  }
`;

const Signin = () => {
  const navigate = useNavigate(); // React Router를 사용하여 페이지 이동 관리
  const [message, setMessage] = useState(""); // 사용자에게 표시할 메시지 상태
  const kakao_api = process.env.REACT_APP_KAKAO_API_KEY; // 환경 변수에서 Kakao API 키를 가져옴

  // Kakao SDK 초기화
  useEffect(() => {
    if (typeof window.Kakao !== "undefined" && !window.Kakao.isInitialized()) {
      // Kakao SDK가 정의되어 있고 초기화되지 않았으면 초기화 수행
      window.Kakao.init(kakao_api); // 환경 변수에서 가져온 API 키로 초기화
      console.log("Kakao SDK Initialized:", window.Kakao.isInitialized());
    }
  }, [kakao_api]);

  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    window.Kakao.Auth.login({
      success: function (authObj) {
        // 로그인 성공 시 실행
        console.log("카카오 로그인 성공:", authObj);

        // 사용자 정보를 요청
        window.Kakao.API.request({
          url: "/v2/user/me", // 사용자 정보 요청 URL
          success: function (res) {
            console.log("사용자 정보:", res);

            // 사용자 이메일 정보를 가져옴
            const userEmail =
              res.kakao_account && res.kakao_account.email
                ? res.kakao_account.email
                : "이메일 정보 없음";

            // 사용자 인증 상태를 로컬 스토리지에 저장
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userEmail", userEmail);

            setMessage("로그인 성공!"); // 성공 메시지 설정
            navigate("/Home", { replace: true }); // 홈 페이지로 이동
          },
          fail: function (error) {
            // 사용자 정보 요청 실패 시 실행
            console.error("사용자 정보 요청 실패:", error);
            setMessage("사용자 정보를 가져오지 못했습니다.");
          },
        });
      },
      fail: function (error) {
        // 로그인 실패 시 실행
        console.error("카카오 로그인 실패:", error);
        setMessage("로그인 실패. 다시 시도해주세요.");
      },
    });
  };

  return (
    <Background>
      <Container>
        <h2>카카오 로그인</h2>
        {/* 카카오 로그인 버튼 */}
        <Button onClick={handleKakaoLogin}>카카오로 로그인</Button>
        {/* 로그인 상태 메시지 표시 */}
        {message && <p>{message}</p>}
        {/* 하단 푸터 */}
        <Footer />
      </Container>
    </Background>
  );
};

export default Signin;
