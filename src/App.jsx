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
  Trash2,
  RotateCcw,
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
    {
      id: 3,
      title: "Nivel 3: Esquivar muro",
      start: { x: 0, y: 3 },
      goal: { x: 5, y: 3 },
      obstacles: [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
      ],
    },
  ];

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

  const [currentView, setCurrentView] = useState("home");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [robotPos, setRobotPos] = useState(levels[0].start);
  const [commands, setCommands] = useState([]);
  const [status, setStatus] = useState("idle");
  const [pendingLoop, setPendingLoop] = useState(null);

  const currentLevel = levels[currentLevelIndex];

  const robotDesign = {
    face: { emoji: "🤖" },
    color: { bg: "bg-slate-500", border: "border-slate-600" },
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const isObstacle = (x, y) => {
    return currentLevel.obstacles.some(
      (obstacle) => obstacle.x === x && obstacle.y === y
    );
  };

  const getNextPosition = (position, direction) => {
    let nextX = position.x;
    let nextY = position.y;

    if (direction === "UP") nextY -= 1;
    if (direction === "DOWN") nextY += 1;
    if (direction === "LEFT") nextX -= 1;
    if (direction === "RIGHT") nextX += 1;

    return { x: nextX, y: nextY };
  };

  const isValidMove = (position) => {
    const insideGrid =
      position.x >= 0 &&
      position.x < GRID_SIZE &&
      position.y >= 0 &&
      position.y < GRID_SIZE;

    if (!insideGrid) return false;
    if (isObstacle(position.x, position.y)) return false;

    return true;
  };

  const addCommand = (direction) => {
    if (status === "running") return;
    if (commands.length >= 20) return;

    if (pendingLoop) {
      setCommands((prev) => [
        ...prev,
        { type: "loop", times: pendingLoop, direction },
      ]);
      setPendingLoop(null);
      return;
    }

    setCommands((prev) => [...prev, { type: "single", direction }]);
  };

  const removeCommand = (index) => {
    if (status === "running") return;
    setCommands((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCommands = () => {
    if (status === "running") return;
    setCommands([]);
    setPendingLoop(null);
  };

  const resetLevel = () => {
    setRobotPos(currentLevel.start);
    setCommands([]);
    setPendingLoop(null);
    setStatus("idle");
  };

  const enterGame = (levelIndex = 0) => {
    setCurrentLevelIndex(levelIndex);
    setRobotPos(levels[levelIndex].start);
    setCommands([]);
    setPendingLoop(null);
    setStatus("idle");
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
      setCommands([]);
      setPendingLoop(null);
      setStatus("idle");
    }
  };

  const runProgram = async () => {
    if (status === "running") return;
    if (commands.length === 0) return;

    setStatus("running");
    let currentPosition = currentLevel.start;
    setRobotPos(currentPosition);

    await sleep(400);

    for (const command of commands) {
      const steps =
        command.type === "loop"
          ? Array.from({ length: command.times }, () => command.direction)
          : [command.direction];

      for (const step of steps) {
        const nextPosition = getNextPosition(currentPosition, step);

        if (!isValidMove(nextPosition)) {
          setStatus("error");
          return;
        }

        currentPosition = nextPosition;
        setRobotPos(currentPosition);

        await sleep(300);
      }
    }

    const reachedGoal =
      currentPosition.x === currentLevel.goal.x &&
      currentPosition.y === currentLevel.goal.y;

    if (reachedGoal) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  const renderArrowIcon = (direction, size = 18) => {
    if (direction === "UP") return <ArrowUp size={size} />;
    if (direction === "DOWN") return <ArrowDown size={size} />;
    if (direction === "LEFT") return <ArrowLeft size={size} />;
    if (direction === "RIGHT") return <ArrowRight size={size} />;
    return null;
  };

  const renderGrid = () => {
    const cells = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isRobotHere = robotPos.x === x && robotPos.y === y;
        const isGoalHere =
          currentLevel.goal.x === x && currentLevel.goal.y === y;
        const isObstacleHere = isObstacle(x, y);

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
                className={`absolute z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md border-b-4 ${robotDesign.color.bg} ${robotDesign.color.border}`}
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
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
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

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-start">
        <section className="w-full lg:w-auto bg-white p-6 rounded-3xl shadow-xl border-4 border-sky-100">
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

          <div className="flex gap-3">
            <button
              onClick={resetLevel}
              disabled={status === "running"}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 py-3 rounded-xl border border-slate-300 disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcw size={18} />
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

          {status === "success" && (
            <div className="bg-green-100 border-2 border-green-300 text-green-800 font-bold px-4 py-3 rounded-xl mt-4 text-center">
              ¡Programa correcto! Llegaste a la meta.
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-100 border-2 border-red-300 text-red-800 font-bold px-4 py-3 rounded-xl mt-4 text-center">
              El programa falló o chocó con un obstáculo.
            </div>
          )}
        </section>

        <section className="w-full lg:w-96 bg-white p-6 rounded-3xl shadow-xl border-4 border-indigo-100">
          <h3 className="text-2xl font-bold text-indigo-900 mb-4">
            Memoria de comandos
          </h3>

          <div className="mb-4 bg-purple-50 p-3 rounded-xl border-2 border-purple-200">
            <h4 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
              <Repeat size={16} />
              Bucle
            </h4>

            {pendingLoop ? (
              <div className="text-purple-700 font-bold text-sm text-center bg-white p-2 rounded-lg border border-purple-200">
                Selecciona una flecha para repetir x{pendingLoop}
                <button
                  onClick={() => setPendingLoop(null)}
                  className="block mx-auto mt-1 text-red-500 text-xs underline"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPendingLoop(2)}
                  className="bg-purple-200 hover:bg-purple-300 text-purple-900 font-bold py-2 rounded-lg"
                >
                  x2
                </button>
                <button
                  onClick={() => setPendingLoop(3)}
                  className="bg-purple-200 hover:bg-purple-300 text-purple-900 font-bold py-2 rounded-lg"
                >
                  x3
                </button>
                <button
                  onClick={() => setPendingLoop(4)}
                  className="bg-purple-200 hover:bg-purple-300 text-purple-900 font-bold py-2 rounded-lg"
                >
                  x4
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => addCommand("UP")}
              className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-800 rounded-xl p-3 font-bold flex flex-col items-center justify-center"
            >
              <ArrowUp size={28} />
              Arriba
            </button>

            <button
              onClick={() => addCommand("DOWN")}
              className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-800 rounded-xl p-3 font-bold flex flex-col items-center justify-center"
            >
              <ArrowDown size={28} />
              Abajo
            </button>

            <button
              onClick={() => addCommand("LEFT")}
              className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-800 rounded-xl p-3 font-bold flex flex-col items-center justify-center"
            >
              <ArrowLeft size={28} />
              Izquierda
            </button>

            <button
              onClick={() => addCommand("RIGHT")}
              className="bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 text-blue-800 rounded-xl p-3 font-bold flex flex-col items-center justify-center"
            >
              <ArrowRight size={28} />
              Derecha
            </button>
          </div>

          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 min-h-[160px] mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-600">
                Bloques: {commands.length}/20
              </span>

              {commands.length > 0 && (
                <button
                  onClick={clearCommands}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            {commands.length === 0 ? (
              <div className="text-slate-400 italic text-sm">
                Agrega flechas para construir tu programa.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {commands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => removeCommand(index)}
                    className={`min-w-10 h-10 px-2 rounded-lg border-2 flex items-center justify-center gap-1 shadow-sm ${
                      command.type === "loop"
                        ? "bg-purple-100 border-purple-300 text-purple-800"
                        : "bg-white border-slate-300"
                    }`}
                    title="Eliminar comando"
                  >
                    {command.type === "loop" && (
                      <span className="text-xs font-black">x{command.times}</span>
                    )}
                    {renderArrowIcon(command.direction)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={runProgram}
            disabled={commands.length === 0 || status === "running"}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
          >
            <Play size={22} />
            Ejecutar programa
          </button>
        </section>
      </div>
    </div>
  );
}