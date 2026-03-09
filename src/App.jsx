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
} from "lucide-react";

export default function App() {
  const coins = 0;
  const GRID_SIZE = 6;

  const [robotPos] = useState({ x: 0, y: 2 });
  const goal = { x: 5, y: 2 };

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

  const renderGrid = () => {
    const cells = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isRobotHere = robotPos.x === x && robotPos.y === y;
        const isGoalHere = goal.x === x && goal.y === y;

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`w-12 h-12 sm:w-14 sm:h-14 border-2 rounded-lg flex items-center justify-center text-xl sm:text-2xl relative
              ${
                isGoalHere && !isRobotHere
                  ? "bg-green-100 border-green-400"
                  : "bg-slate-100 border-slate-300"
              }`}
          >
            {isGoalHere && !isRobotHere && (
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
  }) => {
    return (
      <div
        className={`bg-white rounded-3xl shadow-lg border-4 ${borderClass} p-6 flex items-center gap-6`}
      >
        <div className={`${bgClass} ${textClass} p-4 rounded-2xl`}>
          <Icon size={40} />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">{title}</h2>
          <p className="text-slate-500 font-medium">{desc}</p>
        </div>
      </div>
    );
  };

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

      <section className="w-full max-w-2xl mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
          Vista inicial del tablero
        </h2>

        <div
          className="grid gap-2 justify-center"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {renderGrid()}
        </div>
      </section>

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
          />
        ))}
      </div>
    </div>
  );
}