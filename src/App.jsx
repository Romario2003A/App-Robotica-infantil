import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  Trash2,
  Battery,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronLeft,
  Repeat,
  Cpu,
  HelpCircle,
  Terminal,
  Sparkles,
  CircleDot,
  Settings,
  Archive,
  Gamepad2,
  Timer,
  RadioReceiver,
  Star,
  Hexagon,
  ShoppingCart,
  Info,
  ChevronRight,
  Music,
  Music4,
} from 'lucide-react';

// --- MOTOR DE SONIDO ---
let sharedAudioContext = null;

const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    // Crear el contexto solo una vez y reutilizarlo
    if (!sharedAudioContext) {
      sharedAudioContext = new AudioContext();
    }
    const ctx = sharedAudioContext;
    
    // Los navegadores pausan el audio por defecto, hay que reanudarlo tras interactuar
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'delete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'move') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.setValueAtTime(250, now + 0.05);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'collect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554.37, now + 0.1);
      osc.frequency.setValueAtTime(659.25, now + 0.2);
      osc.frequency.setValueAtTime(880, now + 0.3);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'buy') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1108.73, now + 0.1);
      osc.frequency.setValueAtTime(1318.51, now + 0.2);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    console.error('Audio error', e);
  }
};

// --- NIVELES CORREGIDOS ---
const SECTION_1_LEVELS = [
  { id: 1, title: 'Nivel 1: Línea recta', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [], par: 5 },
  { id: 2, title: 'Nivel 2: La primera curva', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }], par: 10 },
  { id: 3, title: 'Nivel 3: El pozo', start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 5 }, { x: 1, y: 4 }, { x: 3, y: 1 }, { x: 3, y: 0 }, { x: 2, y: 2 }], par: 10 },
  { id: 4, title: 'Nivel 4: Esquivar el muro', start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }], par: 9 },
  { id: 5, title: 'Nivel 5: Escalones', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 3 }], par: 10 },
  { id: 6, title: 'Nivel 6: La C invertida', start: { x: 0, y: 0 }, goal: { x: 3, y: 0 }, obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 1 }], par: 11 },
  { id: 7, title: 'Nivel 7: El callejón', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }], par: 5 },
  { id: 8, title: 'Nivel 8: Serpentina', start: { x: 0, y: 0 }, goal: { x: 0, y: 5 }, obstacles: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }], par: 19 },
  { id: 9, title: 'Nivel 9: Escapista', start: { x: 2, y: 2 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }], par: 6 },
  { id: 10, title: 'Nivel 10: El gran viaje', start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 2 }, { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }], par: 17 },
  { id: 111, title: 'Nivel 11: La barrera', start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }], par: 11 },
  { id: 112, title: 'Nivel 12: El foso doble', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }], par: 20 },
  { id: 113, title: 'Nivel 13: Laberinto básico', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 4 }, { x: 3, y: 5 }], par: 14 },
  { id: 114, title: 'Nivel 14: Escalones gigantes', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }], par: 18 },
  { id: 115, title: 'Nivel 15: Rodeo Doble', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }], par: 15 },
  { id: 116, title: 'Nivel 16: El gran gancho', start: { x: 2, y: 3 }, goal: { x: 2, y: 2 }, obstacles: [{ x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 2 }, { x: 2, y: 1 }], par: 19 },
  { id: 117, title: 'Nivel 17: Zigzag denso', start: { x: 0, y: 0 }, goal: { x: 0, y: 4 }, obstacles: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }], par: 14 },
  { id: 118, title: 'Nivel 18: El caracol', start: { x: 0, y: 0 }, goal: { x: 2, y: 2 }, obstacles: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 0, y: 2 }, { x: 0, y: 3 }], par: 10 },
  { id: 119, title: 'Nivel 19: La letra M', start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 5 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }], par: 20 },
  { id: 120, title: 'Nivel 20: Memoria Llena', start: { x: 0, y: 0 }, goal: { x: 5, y: 1 }, obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 5, y: 0 }], hint: '¡Usa todo tu espacio de código! Sigue el único camino posible.', par: 24 },
];

const SECTION_2_LEVELS = [
  { id: 11, title: 'Nivel 1: Viaje Largo', start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [], hint: "No hay bloque 'x6'. Combina un bucle con otra flecha.", par: 2 },
  { id: 12, title: 'Nivel 2: La gran escalera', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 3 }], par: 4 },
  { id: 13, title: 'Nivel 3: Salto de rana', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{ x: 1, y: 2 }, { x: 3, y: 2 }], par: 6 },
  { id: 14, title: 'Nivel 4: Cuadrado perfecto', start: { x: 1, y: 1 }, goal: { x: 1, y: 1 }, obstacles: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], hint: 'Haz que el robot dé una vuelta en círculo.', par: 4 },
  { id: 15, title: 'Nivel 5: Doble zigzag', start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }], par: 6 },
  { id: 16, title: 'Nivel 6: Muro inmenso', start: { x: 0, y: 5 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 2, y: 5 }, { x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 1 }], par: 5 },
  { id: 17, title: 'Nivel 7: El túnel', start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 0, y: 1 }, { x: 2, y: 1 }, { x: 4, y: 1 }], par: 2 },
  { id: 18, title: 'Nivel 8: Arriba y Abajo', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 2 }], par: 8 },
  { id: 19, title: 'Nivel 9: Salto triple', start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 5 }, { x: 1, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 2 }], par: 6 },
  { id: 20, title: 'Nivel 10: La espiral', start: { x: 0, y: 0 }, goal: { x: 2, y: 3 }, obstacles: [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 }, { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 0 }], par: 9 },
];

const SECTION_3_LEVELS = [
  { id: 21, title: 'Nivel 1: La Roca Fantasma', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [], dynamicObstacles: () => (Math.random() > 0.5 ? [{ x: 2, y: 2 }] : []), hint: 'La roca del medio aparece a veces. ¡Usa el Sensor para esquivarla!', par: 6 },
  { id: 22, title: 'Nivel 2: Dos fantasmas', start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [], dynamicObstacles: () => { const obs = []; if (Math.random() > 0.5) obs.push({ x: 2, y: 0 }); if (Math.random() > 0.5) obs.push({ x: 4, y: 0 }); return obs; }, par: 7 },
  { id: 23, title: 'Nivel 3: El pasillo embrujado', start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }], dynamicObstacles: () => (Math.random() > 0.5 ? [{ x: 3, y: 3 }] : []), par: 6 },
  { id: 24, title: 'Nivel 4: Bajada peligrosa', start: { x: 2, y: 0 }, goal: { x: 2, y: 5 }, obstacles: [], dynamicObstacles: () => (Math.random() > 0.5 ? [{ x: 2, y: 2 }] : [{ x: 2, y: 4 }]), par: 6 },
  { id: 25, title: 'Nivel 5: Espejismo', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 2 }], dynamicObstacles: () => (Math.random() > 0.5 ? [{ x: 4, y: 3 }] : [{ x: 5, y: 4 }]), par: 8 },
  { id: 26, title: 'Nivel 6: Campo minado', start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [], dynamicObstacles: () => { const obs = []; if (Math.random() > 0.5) obs.push({ x: 1, y: 0 }); if (Math.random() > 0.5) obs.push({ x: 2, y: 0 }); if (Math.random() > 0.5) obs.push({ x: 3, y: 0 }); return obs; }, par: 7 },
  { id: 27, title: 'Nivel 7: Zigzag mágico', start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 5 }, { x: 3, y: 3 }], dynamicObstacles: () => (Math.random() > 0.5 ? [{ x: 2, y: 4 }] : [{ x: 4, y: 2 }]), par: 8 },
  { id: 28, title: 'Nivel 8: El bloque central', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{ x: 2, y: 1 }, { x: 2, y: 3 }], dynamicObstacles: () => (Math.random() > 0.5 ? [{ x: 2, y: 2 }] : []), par: 6 },
  { id: 29, title: 'Nivel 9: El laberinto cambiante', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 4, y: 4 }], dynamicObstacles: () => (Math.random() > 0.5 ? [{ x: 0, y: 1 }, { x: 5, y: 4 }] : [{ x: 1, y: 0 }, { x: 4, y: 5 }]), par: 10 },
  { id: 30, title: 'Nivel 10: La prueba final', start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }], dynamicObstacles: () => { const obs = []; if (Math.random() > 0.5) obs.push({ x: 1, y: 3 }); if (Math.random() > 0.5) obs.push({ x: 3, y: 3 }); return obs; }, hint: 'Las rocas pueden bloquear tu camino por arriba o por el centro.', par: 8 },
];

const SECTION_4_LEVELS = [
  { id: 31, title: 'Nivel 1: El Escalón', start: { x: 0, y: 2 }, goal: { x: 4, y: 0 }, obstacles: [{ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 0 }], hint: "Graba el truco 'Arriba y Derecha'.", par: 2 },
  { id: 32, title: 'Nivel 2: Las 3 fosas', start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }], par: 4 },
  { id: 33, title: 'Nivel 3: Patrón Zigzag', start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 5 }, { x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 2 }], par: 2 },
  { id: 34, title: 'Nivel 4: Cuadrados', start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, obstacles: [{ x: 1, y: 1 }, { x: 3, y: 3 }], par: 4 },
  { id: 35, title: 'Nivel 5: Muros Paralelos', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }], par: 5 },
  { id: 36, title: 'Nivel 6: Arriba y Abajo', start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 1, y: 3 }, { x: 3, y: 3 }], par: 4 },
  { id: 37, title: 'Nivel 7: El gran salto', start: { x: 0, y: 5 }, goal: { x: 5, y: 1 }, obstacles: [{ x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 2 }], par: 3 },
  { id: 38, title: 'Nivel 8: El código secreto', start: { x: 1, y: 1 }, goal: { x: 4, y: 4 }, obstacles: [{ x: 2, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 4, y: 3 }], par: 4 },
  { id: 39, title: 'Nivel 9: Baile del robot', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{ x: 1, y: 1 }, { x: 3, y: 3 }], par: 4 },
  { id: 40, title: 'Nivel 10: Maestría Abstracción', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 4 }, { x: 5, y: 4 }], par: 3 },
];

const SECTION_5_LEVELS = [
  { id: 41, title: 'Nivel 1: El primer engranaje', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [], items: [{ x: 2, y: 2 }], laserDoor: { x: 4, y: 2 }, hint: 'Recoge el engranaje para abrir la puerta.', par: 5 },
  { id: 42, title: 'Nivel 2: Desvío necesario', start: { x: 0, y: 1 }, goal: { x: 5, y: 1 }, obstacles: [{ x: 2, y: 1 }, { x: 2, y: 2 }], items: [{ x: 2, y: 3 }], laserDoor: { x: 4, y: 1 }, par: 9 },
  { id: 43, title: 'Nivel 3: Dos llaves', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 4, y: 5 }], items: [{ x: 0, y: 5 }, { x: 5, y: 0 }], laserDoor: { x: 4, y: 4 }, par: 12 },
  { id: 44, title: 'Nivel 4: Bucle recolector', start: { x: 0, y: 2 }, goal: { x: 5, y: 4 }, obstacles: [{ x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }], items: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], laserDoor: { x: 5, y: 3 }, hint: 'Usa un bucle para recoger todos los engranajes.', par: 6 },
  { id: 45, title: 'Nivel 5: Laberinto de láseres', start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 4 }, { x: 3, y: 2 }, { x: 3, y: 4 }], items: [{ x: 0, y: 0 }, { x: 2, y: 5 }], laserDoor: { x: 4, y: 0 }, par: 15 },
  { id: 46, title: 'Nivel 6: La trampa', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{ x: 2, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 1 }, { x: 3, y: 3 }], items: [{ x: 2, y: 2 }], laserDoor: { x: 4, y: 2 }, dynamicObstacles: () => (Math.random() > 0.5 ? [{ x: 1, y: 2 }] : []), par: 6 },
  { id: 47, title: 'Nivel 7: Truco y recolección', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 1 }, { x: 3, y: 3 }], items: [{ x: 2, y: 0 }, { x: 4, y: 2 }, { x: 0, y: 4 }], laserDoor: { x: 4, y: 5 }, par: 8 },
  { id: 48, title: 'Nivel 8: Arriba y abajo', start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 1, y: 3 }, { x: 3, y: 3 }], items: [{ x: 1, y: 1 }, { x: 3, y: 5 }], laserDoor: { x: 4, y: 3 }, par: 12 },
  { id: 49, title: 'Nivel 9: Rodeado', start: { x: 2, y: 2 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 3 }], items: [{ x: 2, y: 0 }, { x: 2, y: 4 }], laserDoor: { x: 4, y: 4 }, par: 10 },
  { id: 50, title: 'Nivel 10: Graduación Robótica', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 3 }], items: [{ x: 0, y: 5 }, { x: 5, y: 0 }, { x: 0, y: 3 }], laserDoor: { x: 5, y: 4 }, dynamicObstacles: () => (Math.random() > 0.5 ? [{ x: 3, y: 0 }] : [{ x: 0, y: 1 }]), par: 14 },
];

const SECTION_6_LEVELS = [
  { id: 51, title: 'Nivel 1: Primer Vuelo Libre', start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [], timeLimit: 15, hint: 'Presiona Activar y luego usa las flechas.', par: 0 },
  { id: 52, title: 'Nivel 2: Reflejos', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 4, y: 4 }, { x: 4, y: 5 }], timeLimit: 12, par: 0 },
  { id: 53, title: 'Nivel 3: El Pasillo Rápido', start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }], timeLimit: 8, hint: 'Ve lo más rápido que puedas hacia la derecha.', par: 0 },
  { id: 54, title: 'Nivel 4: Recolección Contrarreloj', start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [], items: [{ x: 0, y: 5 }, { x: 5, y: 5 }], laserDoor: { x: 4, y: 0 }, timeLimit: 15, par: 0 },
  { id: 55, title: 'Nivel 5: Laberinto Express', start: { x: 2, y: 2 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 3 }], timeLimit: 10, par: 0 },
  { id: 56, title: 'Nivel 6: Zona de Riesgo', start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 5 }, { x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 2 }], timeLimit: 12, par: 0 },
  { id: 57, title: 'Nivel 7: El Banco de Baterías', start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 2, y: 1 }, { x: 2, y: 5 }], items: [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 2, y: 4 }], laserDoor: { x: 4, y: 3 }, timeLimit: 14, par: 0 },
  { id: 58, title: 'Nivel 8: Camino Estrecho', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }], timeLimit: 20, par: 0 },
  { id: 59, title: 'Nivel 9: El Sprint de LogiRom', start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 2, y: 0 }, { x: 4, y: 0 }], items: [{ x: 2, y: 5 }], laserDoor: { x: 3, y: 0 }, timeLimit: 12, par: 0 },
  { id: 60, title: 'Nivel 10: Piloto Maestro', start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }], items: [{ x: 0, y: 5 }, { x: 5, y: 0 }], laserDoor: { x: 4, y: 5 }, timeLimit: 18, hint: '¡Demuestra tus reflejos para graduarte!', par: 0 },
];

const GRID_SIZE = 6;

const ROBOT_FACES = [
  { emoji: '🤖', price: 0, owned: true },
  { emoji: '👽', price: 0, owned: true },
  { emoji: '👾', price: 10, owned: false },
  { emoji: '👻', price: 15, owned: false },
  { emoji: '🐶', price: 20, owned: false },
  { emoji: '🦊', price: 20, owned: false },
  { emoji: '🐸', price: 20, owned: false },
  { emoji: '🐹', price: 30, owned: false },
  { emoji: '🦫', price: 30, owned: false },
  { emoji: '🦥', price: 50, owned: false },
];

const ROBOT_COLORS = [
  { name: 'Platino', bg: 'bg-gradient-to-br from-slate-300 to-slate-500', border: 'border-slate-400', price: 0, owned: true },
  { name: 'Océano', bg: 'bg-gradient-to-br from-blue-400 to-blue-600', border: 'border-blue-400', price: 0, owned: true },
  { name: 'Magma', bg: 'bg-gradient-to-br from-red-400 to-rose-600', border: 'border-red-400', price: 5, owned: false },
  { name: 'Neón', bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', border: 'border-emerald-400', price: 10, owned: false },
  { name: 'Galaxia', bg: 'bg-gradient-to-br from-purple-400 to-indigo-600', border: 'border-purple-400', price: 15, owned: false },
  { name: 'Corona', bg: 'bg-gradient-to-br from-yellow-300 to-amber-500', border: 'border-amber-300', price: 40, owned: false },
];

const ONBOARDING_SLIDES = [
  { title: '¡Bienvenido a LogiRom!', desc: 'Descubre el mundo de la programación guiando a tu robot explorador en 60 misiones.', icon: Sparkles, color: 'text-indigo-500', bgIcon: 'bg-indigo-100' },
  { title: 'Aprende Lógica Real', desc: 'Usa secuencias, bucles y sensores. Verás cómo tus instrucciones se traducen a código.', icon: Terminal, color: 'text-emerald-500', bgIcon: 'bg-emerald-100' },
  { title: 'Gana Recompensas', desc: 'Completa los niveles usando la menor cantidad de bloques para ganar 3 estrellas.', icon: Hexagon, color: 'text-amber-500', bgIcon: 'bg-amber-100' },
  { title: 'Personaliza tu Compañero', desc: 'Visita la tienda premium y desbloquea colores y rostros especiales.', icon: ShoppingCart, color: 'text-rose-500', bgIcon: 'bg-rose-100' },
];

const getLevelsBySection = (section) => {
  if (section === 1) return SECTION_1_LEVELS;
  if (section === 2) return SECTION_2_LEVELS;
  if (section === 3) return SECTION_3_LEVELS;
  if (section === 4) return SECTION_4_LEVELS;
  if (section === 5) return SECTION_5_LEVELS;
  return SECTION_6_LEVELS;
};

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('logirom_has_seen_onboarding') ? 'landing' : 'onboarding';
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSection, setCurrentSection] = useState(1);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [coins, setCoins] = useState(0);
  const [levelStars, setLevelStars] = useState({});
  const [shopFaces, setShopFaces] = useState(ROBOT_FACES);
  const [shopColors, setShopColors] = useState(ROBOT_COLORS);
  const [expandedSection, setExpandedSection] = useState(null);
  const [earnedStars, setEarnedStars] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [robotDesign, setRobotDesign] = useState({ face: ROBOT_FACES[0], color: ROBOT_COLORS[0] });

  // --- SISTEMA DE MÚSICA DE FONDO ---
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // Música para los menús (Home, Tienda, etc.)
  const [bgMusic] = useState(() => {
    if (typeof Audio !== "undefined") {
      const audio = new Audio('/musica.mp3');
      audio.loop = true;
      audio.volume = 0.2;
      return audio;
    }
    return null;
  });

  // Música para los niveles (Juego)
  const [levelMusic] = useState(() => {
    if (typeof Audio !== "undefined") {
      // Usaremos este nuevo archivo para los niveles
      const audio = new Audio('/musica-niveles.mp3');
      audio.loop = true;
      audio.volume = 0.15; // Un poco más baja para que destaquen los efectos de sonido
      return audio;
    }
    return null;
  });

  // Controlar qué suena y cuándo se pausa al cambiar de vistas
  useEffect(() => {
    if (!bgMusic || !levelMusic) return;

    const viewsMenu = ['home', 'workshop', 'about'];
    
    if (isMusicPlaying) {
      if (viewsMenu.includes(currentView)) {
        levelMusic.pause();
        bgMusic.play().catch(e => console.log('Autoplay bloqueado', e));
      } else if (currentView === 'game') {
        bgMusic.pause();
        levelMusic.play().catch(e => console.log('Autoplay bloqueado', e));
      } else {
        // En vistas como onboarding o landing, mantenemos en pausa por defecto
        bgMusic.pause();
        levelMusic.pause();
      }
    } else {
      bgMusic.pause();
      levelMusic.pause();
    }
  }, [currentView, isMusicPlaying, bgMusic, levelMusic]);

  const toggleMusic = () => {
    playSound('click');
    if (isMusicPlaying) {
      if (bgMusic) bgMusic.pause();
      if (levelMusic) levelMusic.pause();
    } else {
      if (currentView === 'game' && levelMusic) {
        levelMusic.play().catch(e => console.error("Error al reproducir:", e));
      } else if (bgMusic) {
        bgMusic.play().catch(e => console.error("Error al reproducir:", e));
      }
    }
    setIsMusicPlaying(!isMusicPlaying);
  };
  // ----------------------------------

  const currentLevels = getLevelsBySection(currentSection);
  const level = currentLevels[currentLevelIndex];

  const [robotPos, setRobotPos] = useState(level.start);
  const [commands, setCommands] = useState([]);
  const [pendingLoop, setPendingLoop] = useState(null);
  const [pendingIf, setPendingIf] = useState(null);
  const [isRecordingTrick, setIsRecordingTrick] = useState(false);
  const [customTrick, setCustomTrick] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [status, setStatus] = useState('idle');
  const [activeCommandIndex, setActiveCommandIndex] = useState(-1);
  const [activeLoopIteration, setActiveLoopIteration] = useState(-1);
  const [currentObstacles, setCurrentObstacles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    let timer;
    if (currentSection === 6 && status === 'running' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (currentSection === 6 && status === 'running' && timeLeft === 0) {
      playSound('error');
      setStatus('error');
    }
    return () => clearTimeout(timer);
  }, [timeLeft, status, currentSection]);

  useEffect(() => {
    const terminalContainer = document.getElementById('terminal-container');
    if (terminalContainer) {
      const activeLine = terminalContainer.querySelector('.bg-white\\/10') || terminalContainer.querySelector('.event-line');
      if (activeLine) activeLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeCommandIndex, commands, customTrick, lastEvent]);

  useEffect(() => {
    if (currentView === 'game') resetLevel();
  }, [currentLevelIndex, currentSection, currentView]);

  const completeOnboarding = () => {
    playSound('click');
    localStorage.setItem('logirom_has_seen_onboarding', 'true');
    setCurrentView('landing');
  };

  const resetLevel = () => {
    const lvl = currentLevels[currentLevelIndex];
    setRobotPos(lvl.start);
    setEarnedStars(0);
    setEarnedCoins(0);
    setCommands([]);
    setPendingLoop(null);
    setPendingIf(null);
    setStatus('idle');
    setActiveCommandIndex(-1);
    setActiveLoopIteration(-1);
    setLastEvent(null);
    setIsRecordingTrick(false);
    setCurrentItems([...(lvl.items || [])]);
    setCollectedCount(0);

    if (lvl.timeLimit) setTimeLeft(lvl.timeLimit);
    else setTimeLeft(null);

    if (lvl.dynamicObstacles) setCurrentObstacles(lvl.dynamicObstacles());
    else setCurrentObstacles(lvl.obstacles);
  };

  const calculateReward = () => {
    let stars = 1;
    let coinsGained = 2;

    if (currentSection === 6) {
      if (timeLeft >= level.timeLimit * 0.6) stars = 3;
      else if (timeLeft >= level.timeLimit * 0.3) stars = 2;
    } else {
      const blocksUsed = commands.length;
      if (blocksUsed <= level.par) stars = 3;
      else if (blocksUsed <= level.par + 3) stars = 2;
    }

    if (stars === 2) coinsGained = 5;
    if (stars === 3) coinsGained = 10;

    setEarnedStars(stars);
    setEarnedCoins(coinsGained);

    const currentMaxStars = levelStars[level.id] || 0;
    if (stars > currentMaxStars) {
      setLevelStars({ ...levelStars, [level.id]: stars });
    }

    setCoins((prev) => prev + coinsGained);
  };

  const isObstacle = (x, y) => currentObstacles.some((obs) => obs.x === x && obs.y === y);

  const handleArrowClick = (dir) => {
    playSound('click');

    if (currentSection === 6) {
      if (status !== 'running') return;
      setLastEvent(dir);

      let nextX = robotPos.x;
      let nextY = robotPos.y;

      if (dir === 'UP') nextY -= 1;
      if (dir === 'DOWN') nextY += 1;
      if (dir === 'LEFT') nextX -= 1;
      if (dir === 'RIGHT') nextX += 1;

      if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE || isObstacle(nextX, nextY)) {
        playSound('error');
        setStatus('error');
        return;
      }

      const isDoor = level.laserDoor && nextX === level.laserDoor.x && nextY === level.laserDoor.y;
      if (isDoor && collectedCount < (level.items ? level.items.length : 0)) {
        playSound('error');
        setStatus('error');
        return;
      }

      const newItems = [...currentItems];
      const itemIndex = newItems.findIndex((item) => item.x === nextX && item.y === nextY);

      if (itemIndex !== -1) {
        playSound('collect');
        newItems.splice(itemIndex, 1);
        setCurrentItems(newItems);
        setCollectedCount((c) => c + 1);
      } else {
        playSound('move');
      }

      setRobotPos({ x: nextX, y: nextY });

      if (nextX === level.goal.x && nextY === level.goal.y) {
        playSound('success');
        setStatus('victory_screen');
        calculateReward();
      }

      setTimeout(() => setLastEvent(null), 800);
      return;
    }

    if (status === 'running' || status === 'victory_screen') return;

    if (isRecordingTrick) {
      if (customTrick.length < 5) setCustomTrick([...customTrick, dir]);
      return;
    }

    if (pendingIf) {
      if (!pendingIf.lookDir) {
        setPendingIf({ step: 2, lookDir: dir });
      } else {
        setCommands([...commands, { type: 'if', lookDir: pendingIf.lookDir, actionDir: dir }]);
        setPendingIf(null);
        setStatus('idle');
      }
      return;
    }

    if (commands.length < 24) {
      if (pendingLoop) {
        setCommands([...commands, { type: 'loop', times: pendingLoop, dir }]);
        setPendingLoop(null);
      } else {
        setCommands([...commands, { type: 'single', dir }]);
      }
      setStatus('idle');
    }
  };

  const addTrickCommand = () => {
    playSound('click');
    if (status === 'running' || status === 'victory_screen' || customTrick.length === 0 || currentSection === 6) return;
    if (commands.length < 24) {
      if (pendingLoop) {
        setCommands([...commands, { type: 'loop', times: pendingLoop, dir: 'TRICK' }]);
        setPendingLoop(null);
      } else {
        setCommands([...commands, { type: 'function' }]);
      }
    }
  };

  const removeCommand = (index) => {
    playSound('delete');
    if (status === 'running' || status === 'victory_screen') return;
    const newCommands = [...commands];
    newCommands.splice(index, 1);
    setCommands(newCommands);
  };

  const runProgram = async () => {
    if (status === 'running' || status === 'victory_screen') return;
    playSound('click');

    const boardArea = document.getElementById('game-board-area');
    if (boardArea) boardArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (currentSection === 6) {
      setStatus('running');
      return;
    }

    if (commands.length === 0) return;

    setStatus('running');
    setRobotPos(level.start);

    let execItems = [...(level.items || [])];
    let execCollectedCount = 0;
    setCurrentItems(execItems);
    setCollectedCount(0);

    if (level.dynamicObstacles) setCurrentObstacles(level.dynamicObstacles());

    let currentX = level.start.x;
    let currentY = level.start.y;
    let errorOcurred = false;

    await new Promise((r) => setTimeout(r, 800));

    for (let i = 0; i < commands.length; i++) {
      setActiveCommandIndex(i);
      const cmd = commands[i];
      const iterations = cmd.type === 'loop' ? cmd.times : 1;

      for (let j = 0; j < iterations; j++) {
        if (cmd.type === 'loop') setActiveLoopIteration(j + 1);

        let stepsToExecute = [];

        if (cmd.type === 'function' || (cmd.type === 'loop' && cmd.dir === 'TRICK')) {
          stepsToExecute = customTrick;
        } else if (cmd.type === 'if') {
          let testX = currentX;
          let testY = currentY;
          if (cmd.lookDir === 'UP') testY -= 1;
          if (cmd.lookDir === 'DOWN') testY += 1;
          if (cmd.lookDir === 'LEFT') testX -= 1;
          if (cmd.lookDir === 'RIGHT') testX += 1;

          const isDoor = level.laserDoor && testX === level.laserDoor.x && testY === level.laserDoor.y;
          const isDoorClosed = isDoor && execCollectedCount < (level.items ? level.items.length : 0);
          const isBlocked = isObstacle(testX, testY) || testX < 0 || testX >= GRID_SIZE || testY < 0 || testY >= GRID_SIZE || isDoorClosed;

          stepsToExecute = [isBlocked ? cmd.actionDir : cmd.lookDir];
        } else {
          stepsToExecute = [cmd.dir];
        }

        for (const executeDir of stepsToExecute) {
          let nextX = currentX;
          let nextY = currentY;

          if (executeDir === 'UP') nextY -= 1;
          if (executeDir === 'DOWN') nextY += 1;
          if (executeDir === 'LEFT') nextX -= 1;
          if (executeDir === 'RIGHT') nextX += 1;

          const isDoor = level.laserDoor && nextX === level.laserDoor.x && nextY === level.laserDoor.y;
          const isDoorClosed = isDoor && execCollectedCount < (level.items ? level.items.length : 0);

          if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE || isObstacle(nextX, nextY) || isDoorClosed) {
            errorOcurred = true;
            break;
          }

          currentX = nextX;
          currentY = nextY;
          setRobotPos({ x: currentX, y: currentY });

          const itemIndex = execItems.findIndex((item) => item.x === currentX && item.y === currentY);
          if (itemIndex !== -1) {
            playSound('collect');
            execItems.splice(itemIndex, 1);
            execCollectedCount++;
            setCurrentItems([...execItems]);
            setCollectedCount(execCollectedCount);
          } else {
            playSound('move');
          }

          await new Promise((r) => setTimeout(r, 400));
        }

        if (errorOcurred) break;
      }

      setActiveLoopIteration(-1);
      if (errorOcurred) break;
    }

    setActiveCommandIndex(-1);

    if (errorOcurred) {
      playSound('error');
      setStatus('error');
    } else if (currentX === level.goal.x && currentY === level.goal.y) {
      playSound('success');
      setStatus('victory_screen');
      calculateReward();
    } else {
      playSound('error');
      setStatus('error');
    }
  };

  const nextLevel = () => {
    if (currentLevelIndex < currentLevels.length - 1) setCurrentLevelIndex(currentLevelIndex + 1);
    else setCurrentView('home');
  };

  const ArrowIcon = ({ dir, size = 20, className = '' }) => {
    if (dir === 'UP') return <ArrowUp size={size} className={className} />;
    if (dir === 'DOWN') return <ArrowDown size={size} className={className} />;
    if (dir === 'LEFT') return <ArrowLeft size={size} className={className} />;
    if (dir === 'RIGHT') return <ArrowRight size={size} className={className} />;
    if (dir === 'TRICK') return <Sparkles size={size} className={className} />;
    return null;
  };

  const formatDirCode = (dir) => (dir ? dir.charAt(0) + dir.slice(1).toLowerCase() : '');

  const renderTerminalCode = () => {
    let lines = [];
    let lineNum = 1;

    if (currentSection === 6) {
      lines.push(
        <div key="ev1" className="px-2 py-0.5 flex items-center">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">int</span> <span className="text-blue-300">bateria</span> = <span className="text-orange-300">100</span>;</div>
        </div>
      );
      lines.push(
        <div key="ev2" className="px-2 py-0.5 flex items-center mt-2">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">void</span> <span className="text-pink-300">setup</span>() {'{'}</div>
        </div>
      );
      lines.push(
        <div key="ev3" className="px-2 py-0.5 flex items-center ml-4">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-yellow-200">attachInterrupt</span>(BTN_UP, moveUp, FALLING);</div>
        </div>
      );
      lines.push(
        <div key="ev4" className="px-2 py-0.5 flex items-center mt-2">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div>{'}'}</div>
        </div>
      );

      if (lastEvent) {
        lines.push(
          <div key="ev-act" className="px-2 py-0.5 flex items-center bg-white/10 border-l-4 border-red-500 mt-2 event-line">
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div>
              <span className="text-purple-400">void</span>{' '}
              <span className="text-pink-300">move{formatDirCode(lastEvent)}</span>() {'{'} robot.
              <span className="text-yellow-200">move{formatDirCode(lastEvent)}</span>(); {'}'}
            </div>
          </div>
        );
      }

      return lines;
    }

    if (customTrick.length > 0) {
      lines.push(
        <div key="fs" className="px-2 py-0.5 flex items-center mt-1">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">void</span> <span className="text-pink-300">miTruco</span>() {'{'}</div>
        </div>
      );

      customTrick.forEach((t, i) =>
        lines.push(
          <div key={`tr${i}`} className="px-2 py-0.5 flex items-center ml-4">
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div>robot.<span className="text-yellow-200">move{formatDirCode(t)}</span>();</div>
          </div>
        )
      );

      lines.push(
        <div key="fe" className="px-2 py-0.5 flex items-center mb-1">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div>{'}'}</div>
        </div>
      );
    }

    lines.push(
      <div key="ls" className="px-2 py-0.5 flex items-center mt-1">
        <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
        <div><span className="text-purple-400">void</span> <span className="text-blue-300">loop</span>() {'{'}</div>
      </div>
    );

    if (commands.length === 0) {
      lines.push(
        <div key="empty" className="px-2 py-0.5 flex items-center ml-4 opacity-60">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div>// Esperando instrucciones...</div>
        </div>
      );
    }

    commands.forEach((cmd, idx) => {
      const isActive = idx === activeCommandIndex;
      const bg = isActive ? 'bg-white/10 border-l-4 border-yellow-400' : 'hover:bg-white/5';

      if (cmd.type === 'single') {
        lines.push(
          <div key={`cmd-${idx}`} className={`px-2 py-0.5 flex items-center ml-4 ${bg}`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div>robot.<span className="text-yellow-200">move{formatDirCode(cmd.dir)}</span>();</div>
          </div>
        );
      } else if (cmd.type === 'loop') {
        lines.push(
          <div key={`cmd-${idx}`} className={`px-2 py-0.5 flex items-center ml-4 ${bg}`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div>
              <span className="text-purple-400">for</span>(i &lt; {cmd.times}) {'{'}{' '}
              {cmd.dir === 'TRICK' ? (
                <>
                  <span className="text-pink-300">miTruco</span>();
                </>
              ) : (
                <>
                  robot.<span className="text-yellow-200">move{formatDirCode(cmd.dir)}</span>();
                </>
              )}{' '}
              {'}'}
            </div>
          </div>
        );
      } else if (cmd.type === 'if') {
        lines.push(
          <div key={`cmd-${idx}`} className={`px-2 py-0.5 flex items-center ml-4 ${bg}`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div>
              <span className="text-purple-400">if</span>
              <span>(obstaculo </span>
              <span className="text-yellow-200">{formatDirCode(cmd.lookDir)}</span>
              <span>) {'{'} </span>
              <span>move</span>
              <span className="text-yellow-200">{formatDirCode(cmd.actionDir)}</span>
              <span>(); {'}'} else {'{'} </span>
              <span>move</span>
              <span className="text-yellow-200">{formatDirCode(cmd.lookDir)}</span>
              <span>(); {'}'}</span>
            </div>
          </div>
        );
      } else if (cmd.type === 'function') {
        lines.push(
          <div key={`cmd-${idx}`} className={`px-2 py-0.5 flex items-center ml-4 ${bg}`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div><span className="text-pink-300">miTruco</span>();</div>
          </div>
        );
      }
    });

    lines.push(
      <div key="le" className="px-2 py-0.5 flex items-center">
        <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
        <div>{'}'}</div>
      </div>
    );

    return lines;
  };

  const renderGrid = () => {
    const cells = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isRobotHere = robotPos.x === x && robotPos.y === y;
        const isGoalHere = level.goal.x === x && level.goal.y === y;
        const isObsHere = isObstacle(x, y);
        const isItemHere = currentItems.some((i) => i.x === x && i.y === y);
        const isDoorHere = level.laserDoor && level.laserDoor.x === x && level.laserDoor.y === y;
        const totalItems = level.items ? level.items.length : 0;
        const isDoorOpen = collectedCount >= totalItems;

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl relative transition-all duration-300
            ${isObsHere ? 'bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600 scale-[1.02]' : 'bg-slate-50 shadow-inner border-2 border-slate-200 hover:bg-slate-100'}
            ${isGoalHere && !isRobotHere && (!isDoorHere || isDoorOpen) ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 animate-pulse' : ''}
            ${isDoorHere && !isDoorOpen ? 'bg-red-500/10 border-red-400 overflow-hidden' : ''}
            ${isDoorHere && isDoorOpen ? 'bg-green-500/5 border-green-200' : ''}`}
          >
            {isObsHere && '🪨'}
            {isItemHere && <Hexagon className="text-amber-500 fill-amber-400 animate-[spin_4s_linear_infinite] w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />}

            {isDoorHere && !isDoorOpen && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-full h-[3px] bg-red-500 absolute top-1/4 animate-pulse"></div>
                <div className="w-full h-[3px] bg-red-500 absolute top-2/4 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-full h-[3px] bg-red-500 absolute top-3/4 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <Lock size={16} className="text-red-700 z-10 bg-white/80 rounded-full p-0.5 border border-red-200" />
              </div>
            )}

            {isDoorHere && isDoorOpen && !isRobotHere && <Unlock size={20} className="text-green-500/40" />}
            {isGoalHere && !isRobotHere && (!isDoorHere || isDoorOpen) && <Battery className="text-emerald-500 w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />}

            {isRobotHere && (
              <div className={`absolute z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-[0_8px_15px_rgba(0,0,0,0.2)] border-b-[3px] border-white/40 ${robotDesign.color.bg} ${status === 'running' ? 'scale-110' : 'animate-bounce'}`}>
                <span className="drop-shadow-md">{robotDesign.face.emoji}</span>
              </div>
            )}
          </div>
        );
      }
    }

    return cells;
  };

  if (currentView === 'onboarding') {
    const slide = ONBOARDING_SLIDES[currentSlide];
    const Icon = slide.icon;
    const isLast = currentSlide === ONBOARDING_SLIDES.length - 1;

    return (
      <div className="min-h-[100dvh] bg-slate-900 font-sans flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl relative">
          {!isLast && <button onClick={completeOnboarding} className="absolute top-6 right-6 text-slate-400 font-bold">Omitir</button>}
          <div className={`mx-auto w-20 h-20 ${slide.bgIcon} ${slide.color} rounded-2xl flex items-center justify-center mb-6`}><Icon size={40} /></div>
          <h2 className={`text-2xl font-black ${slide.color} mb-3`}>{slide.title}</h2>
          <p className="text-slate-500 font-medium text-sm mb-8 h-20">{slide.desc}</p>
          <div className="flex justify-center gap-2 mb-8">{ONBOARDING_SLIDES.map((_, i) => <div key={i} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200'}`} />)}</div>
          <button onClick={() => (isLast ? completeOnboarding() : setCurrentSlide((s) => s + 1))} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl">{isLast ? '¡Comenzar!' : 'Siguiente'}</button>
        </div>
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <div className="min-h-[100dvh] bg-slate-900 font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 bg-white/10 rounded-[2rem] flex items-center justify-center text-6xl mb-8 animate-bounce">{robotDesign.face.emoji}</div>
        <h1 className="text-6xl font-black text-white mb-4">LogiRom</h1>
        <p className="text-slate-400 text-lg mb-12">Domina el pensamiento computacional.</p>
        <button 
          onClick={() => { 
            playSound('click'); 
            
            // Forzamos el play AQUÍ MISMO en el evento de clic. 
            // Esto evita que el navegador bloquee la música.
            if (bgMusic) {
              bgMusic.play().catch(e => console.error("Error de audio:", e));
            }
            
            setIsMusicPlaying(true); 
            setCurrentView('home'); 
          }} 
          className="px-10 py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          ENTRAR A LA ACADEMIA
        </button>
        <div className="absolute bottom-8 text-slate-600 text-xs font-bold uppercase">Creado por Guedson Romario</div>
      </div>
    );
  }

  if (currentView === 'workshop') {
    return (
      <div className="min-h-[100dvh] bg-slate-900 text-white p-4 flex flex-col items-center">
        <div className="absolute top-4 right-4 bg-amber-400/20 text-amber-400 font-black px-4 py-2 rounded-full border border-amber-400/30 flex items-center gap-2"><Hexagon size={18} /> {coins}</div>
        <h1 className="text-4xl font-black text-amber-400 mt-12 mb-8">Taller Premium</h1>
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 w-full max-w-md">
          <div className="flex justify-center mb-8"><div className={`w-24 h-24 rounded-3xl ${robotDesign.color.bg} flex items-center justify-center text-5xl shadow-lg`}>{robotDesign.face.emoji}</div></div>

          <h3 className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Cabezas</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {shopFaces.map((f, i) => (
              <button
                key={i}
                onClick={() => {
                  if (f.owned) {
                    playSound('click');
                    setRobotDesign((d) => ({ ...d, face: f }));
                  } else if (coins >= f.price) {
                    playSound('buy');
                    setCoins((c) => c - f.price);
                    setShopFaces((prev) => prev.map((item, index) => (index === i ? { ...item, owned: true } : item)));
                    setRobotDesign((d) => ({ ...d, face: { ...f, owned: true } }));
                  }
                }}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${robotDesign.face.emoji === f.emoji ? 'bg-amber-400 scale-110 shadow-lg' : f.owned ? 'bg-white/10' : 'bg-black/40 opacity-50'}`}
              >
                {f.emoji}
                {!f.owned && <div className="absolute -bottom-1 bg-black text-amber-400 text-[8px] px-1 rounded border border-amber-400/50">{f.price}</div>}
              </button>
            ))}
          </div>

          <h3 className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Chasis</h3>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {shopColors.map((c, i) => (
              <button
                key={i}
                title={c.name}
                onClick={() => {
                  if (c.owned) {
                    playSound('click');
                    setRobotDesign((d) => ({ ...d, color: c }));
                  } else if (coins >= c.price) {
                    playSound('buy');
                    setCoins((prev) => prev - c.price);
                    setShopColors((prev) => prev.map((item, index) => (index === i ? { ...item, owned: true } : item)));
                    setRobotDesign((d) => ({ ...d, color: { ...c, owned: true } }));
                  }
                }}
                className={`relative w-12 h-12 rounded-full ${c.bg} border-4 transition-all ${robotDesign.color.name === c.name ? 'border-amber-300 scale-110 shadow-lg' : c.owned ? 'border-white/20' : 'border-black/30 opacity-60'}`}
              >
                {!c.owned && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black text-amber-400 text-[8px] px-1 rounded border border-amber-400/50">{c.price}</div>}
              </button>
            ))}
          </div>

          <button onClick={() => setCurrentView('home')} className="w-full bg-indigo-600 py-4 rounded-xl font-black uppercase tracking-widest">Equipar y Volver</button>
        </div>
      </div>
    );
  }

  if (currentView === 'about') {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] max-w-md w-full shadow-2xl text-center border-t-8 border-indigo-600">
          <div className="text-5xl mb-4">👨‍💻</div>
          <h3 className="text-xl font-black text-slate-800">Guedson Romario Quispe Anchaise</h3>
          <p className="text-indigo-600 font-bold text-sm mb-6 uppercase tracking-tighter">Estudiante Ing. Sistemas | UC Arequipa</p>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed bg-slate-50 p-4 rounded-xl italic">"LogiRom es un puente entre el juego y la ingeniería."</p>
          <button onClick={() => setCurrentView('home')} className="w-full bg-slate-800 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2"><ChevronLeft size={20} /> Volver</button>
        </div>
      </div>
    );
  }

  const ModuleCard = ({ sectionNum, title, desc, icon: Icon, bgGradient, ringClass }) => {
    const isExpanded = expandedSection === sectionNum;
    const levels = getLevelsBySection(sectionNum);
    const starsEarned = levels.reduce((a, l) => a + (levelStars[l.id] || 0), 0);
    const totalPossible = levels.length * 3;

    return (
      <div className={`bg-white rounded-3xl shadow-sm border border-slate-200 transition-all overflow-hidden ${isExpanded ? `ring-2 ${ringClass}` : ''}`}>
        <div onClick={() => { playSound('click'); setExpandedSection(isExpanded ? null : sectionNum); }} className="p-6 cursor-pointer flex flex-col sm:flex-row items-center gap-6 relative">
          <div className="absolute top-4 right-4 bg-slate-50 text-slate-400 text-[10px] font-black px-2 py-1 rounded-full border flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-500" /> {starsEarned}/{totalPossible}</div>
          <div className={`w-14 h-14 rounded-2xl text-white shadow-md flex items-center justify-center ${bgGradient}`}><Icon size={30} /></div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-black text-slate-800">Módulo {sectionNum}: {title}</h2>
            <p className="text-slate-400 text-sm font-medium">{desc}</p>
          </div>
        </div>

        <div className={`transition-all duration-500 ${isExpanded ? 'max-h-[500px] opacity-100 p-6 pt-0 border-t border-slate-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {levels.map((l, i) => {
              const stars = levelStars[l.id] || 0;
              const isLocked = i > 0 && !(levelStars[levels[i - 1].id] > 0);

              return (
                <button
                  key={l.id}
                  disabled={isLocked}
                  onClick={() => {
                    playSound('click');
                    setCurrentSection(sectionNum);
                    setCurrentLevelIndex(i);
                    setCurrentView('game');
                  }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center font-black transition-all ${stars > 0 ? `${bgGradient} text-white` : isLocked ? 'bg-slate-50 text-slate-200 cursor-not-allowed' : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'}`}
                >
                  {i + 1}
                  <div className="flex mt-1 gap-0.5">
                    {isLocked ? <Lock size={10} /> : [1, 2, 3].map((s) => <Star key={s} size={8} className={s <= stars ? 'fill-amber-300 text-amber-300' : 'fill-transparent'} />)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'home') {
    return (
      <div className="min-h-[100dvh] bg-slate-50 p-4 flex flex-col items-center">
        <button onClick={() => setCurrentView('about')} className="absolute left-4 top-4 bg-white p-2.5 rounded-full shadow border border-slate-100 text-indigo-600"><Info size={22} /></button>
        
        {/* Botón de música agregado al lado de los créditos/info */}
        <button onClick={toggleMusic} className="absolute left-16 top-4 bg-white p-2.5 rounded-full shadow border border-slate-100 text-indigo-600">
          {isMusicPlaying ? <Music size={22} /> : <div className="relative"><Music size={22} className="opacity-50" /><div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 -rotate-45"></div></div>}
        </button>

        <div className="absolute right-4 top-4 bg-amber-50 text-amber-600 font-black px-4 py-1.5 rounded-full border border-amber-200 flex items-center gap-1.5"><Hexagon size={16} className="fill-amber-400" /> {coins}</div>

        <header className="text-center mt-12 mb-10 w-full max-w-2xl">
          <h1 className="text-5xl font-black text-slate-900 mb-6 pb-2">Academia LogiRom</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed max-w-md mx-auto">Domina la lógica de programación paso a paso con retos cada vez más complejos.</p>

          <div onClick={() => setCurrentView('workshop')} className="bg-slate-900 text-white p-4 rounded-3xl shadow-xl flex items-center justify-between cursor-pointer group transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl ${robotDesign.color.bg}`}>{robotDesign.face.emoji}</div>
              <div className="text-left">
                <h3 className="font-black text-amber-400 flex items-center gap-2">Tienda Premium</h3>
                <p className="text-xs text-white/50">Personaliza tu robot</p>
              </div>
            </div>
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </div>
        </header>

        <div className="w-full max-w-2xl flex flex-col gap-4">
          <ModuleCard sectionNum={1} title="Secuencias" desc="El primer paso: instrucciones básicas." icon={Play} bgGradient="bg-gradient-to-br from-blue-500 to-indigo-600" ringClass="ring-blue-100" />
          <ModuleCard sectionNum={2} title="Bucles" desc="Repetición eficiente de código." icon={Repeat} bgGradient="bg-gradient-to-br from-purple-500 to-fuchsia-600" ringClass="ring-purple-100" />
          <ModuleCard sectionNum={3} title="Sensores" desc="Condicionales y toma de decisiones." icon={Cpu} bgGradient="bg-gradient-to-br from-orange-400 to-rose-500" ringClass="ring-orange-100" />
          <ModuleCard sectionNum={4} title="Funciones" desc="Macros y subrutinas grabadas." icon={Sparkles} bgGradient="bg-gradient-to-br from-pink-400 to-rose-600" ringClass="ring-pink-100" />
          <ModuleCard sectionNum={5} title="Variables" desc="Gestión de inventario lógico." icon={Archive} bgGradient="bg-gradient-to-br from-teal-400 to-emerald-600" ringClass="ring-teal-100" />
          <ModuleCard sectionNum={6} title="Live Mode" desc="Control remoto en tiempo real." icon={Gamepad2} bgGradient="bg-gradient-to-br from-red-500 to-rose-700" ringClass="ring-red-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center p-2 sm:p-4">
      {status === 'victory_screen' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl">
            <CheckCircle2 size={60} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-slate-800 mb-6 pb-1">¡Misión Cumplida!</h2>
            <div className="flex justify-center gap-3 mb-8">{[1, 2, 3].map((s) => <Star key={s} size={50} className={s <= earnedStars ? 'fill-amber-400 text-amber-400 drop-shadow-md' : 'fill-slate-100'} />)}</div>
            <div className="bg-amber-50 px-6 py-4 rounded-2xl mb-8 font-black text-amber-800 flex items-center gap-2 justify-center"><Hexagon className="fill-amber-400" /> +{earnedCoins} Tuercas</div>
            <div className="flex gap-2">
              <button onClick={resetLevel} className="flex-1 bg-slate-100 py-4 rounded-xl font-bold">Reintentar</button>
              <button onClick={nextLevel} className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-black">Siguiente</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 text-slate-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"><ChevronLeft size={20} /> Mapa</button>
          
          {/* Botón de música en la cabecera de los niveles */}
          <button onClick={toggleMusic} className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600">
            {isMusicPlaying ? <Music size={20} /> : <div className="relative"><Music size={20} className="opacity-50" /><div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 -rotate-45"></div></div>}
          </button>
        </div>
        
        <div className="text-right">
          <h1 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight leading-none">Módulo {currentSection}</h1>
          <p className="text-[10px] sm:text-sm text-indigo-500 font-bold">Nivel {currentLevelIndex + 1}: {level.title.split(': ')[1]}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl items-center lg:items-start flex-1">
        <div id="game-board-area" className="flex flex-col items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 shrink-0 scroll-mt-4">
          <div className="mb-4 h-10 flex items-center justify-between w-full">
            {level.items && <div className="bg-slate-50 border px-3 py-1 rounded-lg text-sm font-black flex items-center gap-2"><Settings size={14} className="animate-spin" /> {collectedCount}/{level.items.length}</div>}
            {currentSection === 6 && timeLeft !== null ? (
              <div className={`border px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${timeLeft <= 5 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-slate-500'}`}>
                <Timer size={12} /> {timeLeft}s
              </div>
            ) : (
              <div className="bg-white border px-3 py-1 rounded-lg text-xs font-bold text-slate-400 flex items-center gap-1">Par: {level.par} <Star size={10} className="fill-amber-400" /></div>
            )}
          </div>

          <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
            {renderGrid()}
          </div>

          {status === 'error' && <div className="bg-rose-50 text-rose-600 px-6 py-2 rounded-xl font-black flex items-center gap-2 animate-bounce mb-4"><AlertTriangle /> Error detectado</div>}

          <div className="w-full max-w-[380px] bg-slate-900 rounded-2xl shadow-xl overflow-hidden font-mono text-[10px] text-left">
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-black/40">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              </div>
              <div className="text-slate-500 uppercase tracking-widest text-[9px] font-black">robot.cpp</div>
              <div className="w-10"></div>
            </div>
            <div id="terminal-container" className="py-2 text-slate-300 h-28 overflow-y-auto custom-scrollbar">{renderTerminalCode()}</div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col flex-1 min-h-[300px]">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex justify-between items-center tracking-tight">
            {currentSection === 6 ? 'Interrupciones' : 'Comandos'}
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-md">Live</span>
          </h2>

          {currentSection === 2 && (
            <div className="mb-4 bg-purple-50 p-4 rounded-2xl border border-purple-100 shadow-sm">
              <h3 className="text-xs font-black uppercase text-purple-800 mb-3 flex items-center gap-2"><Repeat size={14} /> Bucle</h3>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setPendingLoop(n)} className={`py-2 rounded-lg font-black transition-all ${pendingLoop === n ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-purple-600 border border-purple-200'}`}>
                    x{n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentSection === 3 && (
            <div className="mb-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <h3 className="text-xs font-black uppercase text-orange-800 mb-3 flex items-center gap-2"><Cpu size={14} /> Condicional</h3>
              {pendingIf ? (
                <div className="text-sm font-bold text-orange-700 bg-white p-3 rounded-xl border border-orange-200 text-center">
                  {pendingIf.step === 1 ? '1. Elige hacia dónde mirar' : '2. Elige hacia dónde esquivar'}
                  <button onClick={() => setPendingIf(null)} className="block mx-auto mt-2 text-red-500 underline text-xs">Cancelar</button>
                </div>
              ) : (
                <button onClick={() => setPendingIf({ step: 1, lookDir: null })} className="w-full bg-white text-orange-600 py-3 rounded-xl border border-orange-200 font-black flex items-center justify-center gap-2">
                  Instalar Sensor
                </button>
              )}
            </div>
          )}

          {currentSection === 4 && (
            <div className="mb-4 bg-pink-50 p-4 rounded-2xl border border-pink-100">
              <h3 className="text-xs font-black uppercase text-pink-800 mb-3 flex items-center gap-2"><Sparkles size={14} /> Función / Truco</h3>

              <button
                onClick={() => setIsRecordingTrick((prev) => !prev)}
                className={`w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 mb-3 ${isRecordingTrick ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-white text-pink-700 border border-pink-200'}`}
              >
                <CircleDot size={16} className={isRecordingTrick ? 'animate-pulse' : ''} />
                {isRecordingTrick ? 'Detener grabación' : 'Grabar truco'}
              </button>

              <div className="bg-white rounded-xl border border-pink-100 p-3 min-h-[52px] flex items-center justify-between mb-3">
                <div className="flex gap-1 flex-wrap">
                  {customTrick.length === 0 ? (
                    <span className="text-xs text-pink-400 italic">Truco vacío...</span>
                  ) : (
                    customTrick.map((dir, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-lg border border-pink-200 flex items-center justify-center text-pink-700 bg-pink-50">
                        <ArrowIcon dir={dir} size={14} />
                      </div>
                    ))
                  )}
                </div>

                {customTrick.length > 0 && (
                  <button onClick={() => setCustomTrick([])} className="text-red-500">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {!isRecordingTrick && customTrick.length > 0 && (
                <button onClick={addTrickCommand} className="w-full bg-pink-600 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2">
                  <Sparkles size={16} /> Usar miTruco()
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
            {['UP', 'DOWN', 'LEFT', 'RIGHT'].map((d) => (
              <button key={d} onClick={() => handleArrowClick(d)} className="bg-white border-b-4 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 rounded-2xl p-4 font-black flex items-center justify-center transition-all active:translate-y-1 active:border-b-0">
                <ArrowIcon dir={d} size={24} />
              </button>
            ))}
          </div>

          <div className="flex-grow bg-slate-50 rounded-2xl p-4 mb-6 min-h-[120px] shadow-inner overflow-y-auto">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex justify-between">
              Memoria RAM {commands.length}/24
              <Trash2 size={12} className="cursor-pointer" onClick={() => setCommands([])} />
            </h3>

            <div className="flex flex-wrap gap-2">
              {commands.map((c, i) => {
                const active = i === activeCommandIndex;

                if (c.type === 'loop') {
                  return (
                    <div key={i} onClick={() => removeCommand(i)} className={`relative min-w-[42px] h-10 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm border transition-all ${active ? 'bg-amber-400 text-white scale-110 shadow-lg' : 'bg-white text-slate-600 border-slate-100'}`}>
                      <span className="text-xs font-black">x{c.times}</span>
                      <ArrowIcon dir={c.dir} size={16} />
                      {active && activeLoopIteration > 0 && <span className="absolute -bottom-4 text-[8px] bg-white px-1 rounded shadow">{activeLoopIteration}/{c.times}</span>}
                    </div>
                  );
                }

                if (c.type === 'if') {
                  return (
                    <div key={i} onClick={() => removeCommand(i)} className={`relative min-w-[56px] h-10 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm border transition-all ${active ? 'bg-amber-400 text-white scale-110 shadow-lg' : 'bg-white text-slate-600 border-slate-100'}`}>
                      <ArrowIcon dir={c.lookDir} size={14} />
                      <ChevronRight size={12} />
                      <ArrowIcon dir={c.actionDir} size={14} />
                    </div>
                  );
                }

                if (c.type === 'function') {
                  return (
                    <div key={i} onClick={() => removeCommand(i)} className={`relative w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all ${active ? 'bg-amber-400 text-white scale-110 shadow-lg' : 'bg-white text-slate-600 border-slate-100'}`}>
                      <Sparkles size={18} />
                    </div>
                  );
                }

                return (
                  <div key={i} onClick={() => removeCommand(i)} className={`relative w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all ${active ? 'bg-amber-400 text-white scale-110 shadow-lg' : 'bg-white text-slate-600 border-slate-100'}`}>
                    <ArrowIcon dir={c.dir} size={18} />
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button onClick={resetLevel} className="flex-1 bg-white border py-4 rounded-xl font-black text-slate-400 flex items-center justify-center gap-2 shadow-sm">
              <RotateCcw size={18} /> Reset
            </button>
            <button onClick={runProgram} disabled={commands.length === 0 && currentSection !== 6} className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-700 disabled:opacity-50">
              <Play size={18} /> {currentSection === 6 ? 'ACTIVAR' : 'COMPILAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}