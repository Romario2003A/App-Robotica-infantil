import React, { useState } from "react";
import {
  ChevronLeft,
  ShoppingCart,
  Hexagon,
  Play,
  Repeat,
  Cpu,
  Sparkles,
  Archive,
  Gamepad2,
  Battery,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function App() {
  const coins = 0;
  const GRID_SIZE = 6;

  const levels = [
    {
      id: 1,
      title: "Nivel 1: Línea recta",
      start: { x: 0, y: 2 },
      goal: { x: 5, y: 2 },
      obstacles: [],
    },
    {
      id: 2,
      title: "Nivel 2: La primera curva",
      start: { x: 0, y: 0 },
      goal: { x: 5, y: 5 },
      obstacles: [
        { x: 3, y: 0 },
        { x: 3, y: 1 },
        { x: 3, y: 2 },
      ],
    },
  ];

  const [currentView, setCurrentView] = useState("home");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const currentLevel = levels[currentLevelIndex];

  const [robotPos, setRobotPos] = useState(currentLevel.start);

  const robotDesign = {
    face: { emoji: "🤖" },
    color: { bg: "bg-slate-500", border: "border-slate-600" },
  };

  const modules = [
    {
      id: 1,
      title: "Primeros Pasos",
      desc: "Aprende secuencias usando la memoria.",
      icon: Play,
      bgClass: "bg-indigo-100",
      textClass: "text-indigo-600",
      borderClass: "border-indigo-100",
    },
    {
      id: 2,
      title: "Bucles Mágicos",
      desc: "Repite acciones para ahorrar código.",
      icon: Repeat,
      bgClass: "bg-purple-100",
      textClass: "text-purple-600",
      borderClass: "border-purple-100",
    },
    {
      id: 3,
      title: "Decisiones (Sensor)",
      desc: "Haz que tu robot evite rocas fantasma.",
      icon: Cpu,
      bgClass: "bg-orange-100",
      textClass: "text-orange-600",
      borderClass: "border-orange-100",
    },
    {
      id: 4,
      title: "Funciones (Trucos)",
      desc: "Graba combinaciones para saltar muros.",
      icon: Sparkles,
      bgClass: "bg-pink-100",
      textClass: "text-pink-600",
      borderClass: "border-pink-100",
    },
    {
      id: 5,
      title: "Variables (Mochila)",
      desc: "Recolecta para apagar láseres.",
      icon: Archive,
      bgClass: "bg-teal-100",
      textClass: "text-teal-600",
      borderClass: "border-teal-100",
    },
    {
      id: 6,
      title: "Control Remoto",
      desc: "Pilota en vivo y esquiva obstáculos rápidos.",
      icon: Gamepad2,
      bgClass: "bg-red-100",
      textClass: "text-red-600",
      borderClass: "border-red-100",
    },
  ];

  const isObstacle = (x, y) => {
    return currentLevel.obstacles.some(
      (obstacle) => obstacle.x === x && obstacle.y === y
    );
  };

  const moveRobot = (direction) => {
    setRobotPos((prev) => {
      let nextX = prev.x;
      let nextY = prev.y;

      if (direction === "UP") nextY -= 1;
      if (direction === "DOWN") nextY += 1;
      if (direction === "LEFT") nextX -= 1;
      if (direction === "RIGHT") nextX += 1;

      if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
        return prev;
      }

      if (isObstacle(nextX, nextY)) {
        return prev;
      }

      return { x: nextX, y: nextY };
    });
  };

  const resetRobot = () => {
    setRobotPos(currentLevel.start);
  };

  const enterGame = (levelIndex = 0) => {
    setCurrentLevelIndex(levelIndex);
    setRobotPos(levels[levelIndex].start);
    setCurrentView("game");
  };

  const goHome = () => {
    setCurrentView("home");
  };

  const nextLevel = () => {
    const nextIndex = currentLevelIndex + 1;
    if (nextIndex < levels.length) {
      setCurrentLevelIndex(nextIndex);
      setRobotPos(levels[nextIndex].start);
    }
  };

  const renderGrid = () => {
    const cells = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isRobotHere = robotPos.x === x && robotPos.y === y;
        const isGoalHere =
          currentLevel.goal.x === x && currentLevel.goal.y === y;
        const isObstacleHere = isObstacle(x, y);
        const isGoalReached =
          robotPos.x === currentLevel.goal.x &&
          robotPos.y === currentLevel.goal.y;

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-lg flex items-center justify-center text-xl sm:text-2xl relative transition-all
              ${
                isObstacleHere
                  ? "bg-slate-700 border-slate-800"
                  : isGoalHere && !isRobotHere
                  ? "bg-green-100 border-green-400"
                  : "bg-slate-100 border-slate-300"
              }`}
          >
            {isObstacleHere && "🪨"}

            {isGoalHere && !isRobotHere && !isObstacleHere && (
              <Battery className="text-green-600 w-6 h-6 sm:w-8 sm:h-8" />
            )}

            {isRobotHere && (
              <div
                className={`absolute z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md border-b-4 ${robotDesign.color.bg} ${robotDesign.color.border} ${
                  isGoalReached ? "scale-110" : ""
                }`}
              >
                {robotDesign.face.emoji}
              </div>
            )}
          </div>
        );
      }
    }

    return cells;
  };

  const ModuleCard = ({
    title,
    desc,
    icon: Icon,
    bgClass,
    textClass,
    borderClass,
    onClick,
  }) => {
    return (
      <button
        onClick={onClick}
        className={`bg-white rounded-3xl shadow-lg border-4 ${borderClass} p-6 flex items-center gap-6 text-left hover:scale-[1.01] transition-transform w-full`}
      >
        <div className={`${bgClass} ${textClass} p-4 rounded-2xl`}>
          <Icon size={40} />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{title}</h2>
          <p className="text-slate-500 font-medium">{desc}</p>
        </div>
      </button>
    );
  };

  const goalReached =
    robotPos.x === currentLevel.goal.x && robotPos.y === currentLevel.goal.y;

  if (currentView === "home") {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-4 flex flex-col items-center">
        <div className="absolute right-4 top-4 bg-amber-100 text-amber-600 font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-amber-300 z-10">
          <Hexagon size={20} className="fill-amber-400" /> {coins}
        </div>

        <header className="text-center mt-8 mb-8 w-full max-w-2xl relative">
          <h1 className="text-4xl font-black text-indigo-900 tracking-tight mb-3 flex items-center justify-center gap-3">
            🚀 Academia Capi-bot
          </h1>

          <p className="text-lg text-slate-600 font-medium max-w-md mx-auto mb-6">
            Elige tu módulo y gana tuercas doradas completando niveles con código
            perfecto.
          </p>

          <div className="bg-slate-800 text-white rounded-2xl p-4 shadow-lg border-2 border-slate-700 flex items-center justify-between mx-auto w-full">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-b-2 ${robotDesign.color.bg} ${robotDesign.color.border}`}
              >
                {robotDesign.face.emoji}
              </div>

              <div className="text-left">
                <h3 className="font-bold text-lg text-yellow-400 flex items-center gap-2">
                  <ShoppingCart size={18} /> Taller y Tienda
                </h3>
                <p className="text-sm text-slate-300">
                  ¡Gasta tus tuercas en nuevos aspectos!
                </p>
              </div>
            </div>

            <div className="bg-slate-700 p-2 rounded-full text-slate-300">
              <ChevronLeft size={20} className="rotate-180" />
            </div>
          </div>
        </header>

        <div className="w-full max-w-2xl flex flex-col gap-4">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              title={`Módulo ${module.id}: ${module.title}`}
              desc={module.desc}
              icon={module.icon}
              bgClass={module.bgClass}
              textClass={module.textClass}
              borderClass={module.borderClass}
              onClick={() => enterGame(0)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 font-sans p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <button
          onClick={goHome}
          className="flex items-center gap-2 text-sky-700 hover:text-sky-900 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border"
        >
          <ChevronLeft size={20} />
          Mapa
        </button>

        <div className="bg-amber-100 text-amber-600 font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-amber-300">
          <Hexagon size={20} className="fill-amber-400" /> {coins}
        </div>
      </div>

      <section className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-xl border-4 border-sky-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">
            {currentLevel.title}
          </h2>

          <div className="text-sm font-bold text-slate-500">
            Nivel {currentLevel.id}
          </div>
        </div>

        <div
          className="grid gap-2 justify-center mb-6"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {renderGrid()}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            <button
              onClick={() => moveRobot("UP")}
              className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-800 rounded-xl p-3 font-bold flex flex-col items-center justify-center transition-transform active:scale-95"
            >
              <ArrowUp size={28} />
              Arriba
            </button>

            <button
              onClick={() => moveRobot("DOWN")}
              className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-800 rounded-xl p-3 font-bold flex flex-col items-center justify-center transition-transform active:scale-95"
            >
              <ArrowDown size={28} />
              Abajo
            </button>

            <button
              onClick={() => moveRobot("LEFT")}
              className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-800 rounded-xl p-3 font-bold flex flex-col items-center justify-center transition-transform active:scale-95"
            >
              <ArrowLeft size={28} />
              Izquierda
            </button>

            <button
              onClick={() => moveRobot("RIGHT")}
              className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-800 rounded-xl p-3 font-bold flex flex-col items-center justify-center transition-transform active:scale-95"
            >
              <ArrowRight size={28} />
              Derecha
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetRobot}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 py-3 rounded-xl border border-slate-300"
            >
              Reiniciar
            </button>

            <button
              onClick={nextLevel}
              disabled={!goalReached || currentLevelIndex === levels.length - 1}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl border border-green-600 disabled:opacity-50"
            >
              Siguiente nivel
            </button>
          </div>

          {goalReached && (
            <div className="bg-green-100 border-2 border-green-300 text-green-800 font-bold px-4 py-3 rounded-xl mt-2">
              ¡Llegaste a la meta!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}