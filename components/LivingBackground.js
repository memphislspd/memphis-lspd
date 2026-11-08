// components/LivingBackground.js
export default function LivingBackground() {
  return (
    <div className="living-bg-container">
      <div className="glow-orb blue-orb"></div>
      <div className="glow-orb red-orb"></div>
      <div className="glow-orb purple-orb"></div>

      <style jsx>{`
        .living-bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0; /* Находится за контентом */
          overflow: hidden;
          pointer-events: none; /* Чтобы нельзя было кликнуть по фону */
          background: #07090d; /* Тот же цвет, что у тебя в landing-page */
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px); /* Очень сильное размытие, чтобы не было видно границ */
          opacity: 0.15; /* Низкая прозрачность, чтобы не слепило */
          will-change: transform; /* Оптимизация для браузера */
        }

        .blue-orb {
          width: 50vw;
          height: 50vw;
          background: #3f83f8; /* Твой полицейский синий */
          top: -10%;
          left: -10%;
          animation: float-blue 25s ease-in-out infinite alternate;
        }

        .red-orb {
          width: 45vw;
          height: 45vw;
          background: #ff2640; /* Красный */
          bottom: -15%;
          right: -10%;
          animation: float-red 30s ease-in-out infinite alternate;
        }

        .purple-orb {
          width: 40vw;
          height: 40vw;
          background: #9e6bff; /* Фиолетовый для глубины */
          top: 40%;
          left: 30%;
          opacity: 0.08; /* Еще более прозрачный */
          animation: float-purple 20s ease-in-out infinite alternate;
        }

        /* Медленные движения по траектории */
        @keyframes float-blue {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(15vw, 10vh) scale(1.1); }
        }

        @keyframes float-red {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-10vw, -15vh) scale(1.2); }
        }

        @keyframes float-purple {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(5vw, -10vh) scale(1.3); }
        }
      `}</style>
    </div>
  );
}
