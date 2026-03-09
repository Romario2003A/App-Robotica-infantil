import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RotateCcw, Trash2, Battery, AlertTriangle, CheckCircle2, Lock, Unlock, ChevronLeft, Repeat, Wrench, Cpu, HelpCircle, Terminal, Sparkles, CircleDot, Settings, Archive, Gamepad2, Timer, RadioReceiver, Star, Hexagon, ShoppingCart } from 'lucide-react';

// --- MOTOR DE SONIDO (WEB AUDIO API) ---
const playSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
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
    console.error("Audio no soportado o bloqueado", e);
  }
};

// --- DEFINICIÓN DE NIVELES CON "PAR" (ÓPTIMO DE BLOQUES PARA 3 ESTRELLAS) ---
const SECTION_1_LEVELS = [
  { id: 1, title: "Nivel 1: Línea recta", start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [], par: 5 },
  { id: 2, title: "Nivel 2: La primera curva", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 }], par: 10 },
  { id: 3, title: "Nivel 3: El pozo", start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 5 }, { x: 1, y: 4 }, { x: 3, y: 1 }, { x: 3, y: 0 }, { x: 2, y: 2 }], par: 10 },
  { id: 4, title: "Nivel 4: Esquivar el muro", start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }], par: 9 },
  { id: 5, title: "Nivel 5: Escalones", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 3 }], par: 10 },
  { id: 6, title: "Nivel 6: La C invertida", start: { x: 0, y: 0 }, goal: { x: 3, y: 0 }, obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 1 }, { x: 2, y: 1 }], par: 8 },
  { id: 7, title: "Nivel 7: El callejón", start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }], par: 5 },
  { id: 8, title: "Nivel 8: Serpentina", start: { x: 0, y: 0 }, goal: { x: 0, y: 5 }, obstacles: [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }], par: 19 },
  { id: 9, title: "Nivel 9: Atrapado", start: { x: 2, y: 2 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 2 }, { x: 1, y: 3 }, { x: 2, y: 3 }], par: 6 },
  { id: 10, title: "Nivel 10: El gran viaje", start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 2 }, { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }], par: 17 }
];

const SECTION_2_LEVELS = [
  { id: 11, title: "Nivel 1: Viaje Largo", start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [], hint: "No hay bloque 'x5', ¡así que tendrás que combinar un bucle con otra flecha!", par: 2 },
  { id: 12, title: "Nivel 2: La gran escalera", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 2 }, { x: 4, y: 3 }], par: 4 },
  { id: 13, title: "Nivel 3: Salto de rana", start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{ x: 1, y: 2 }, { x: 3, y: 2 }], par: 6 },
  { id: 14, title: "Nivel 4: Cuadrado perfecto", start: { x: 1, y: 1 }, goal: { x: 1, y: 1 }, obstacles: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], hint: "Haz que el robot dé una vuelta en círculo.", par: 4 },
  { id: 15, title: "Nivel 5: Doble zigzag", start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }], par: 6 },
  { id: 16, title: "Nivel 6: Muro inmenso", start: { x: 0, y: 5 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 2, y: 5 }, { x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 }, { x: 2, y: 1 }], par: 5 },
  { id: 17, title: "Nivel 7: El túnel", start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 0, y: 1 }, { x: 2, y: 1 }, { x: 4, y: 1 }], par: 2 },
  { id: 18, title: "Nivel 8: Arriba y Abajo", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 2 }], par: 8 },
  { id: 19, title: "Nivel 9: Salto triple", start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 5 }, { x: 1, y: 4 }, { x: 3, y: 3 }, { x: 3, y: 2 }], par: 6 },
  { id: 20, title: "Nivel 10: La espiral", start: { x: 0, y: 0 }, goal: { x: 2, y: 3 }, obstacles: [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 1 }, { x: 5, y: 0 }, { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 0 }], par: 9 }
];

const SECTION_3_LEVELS = [
  { id: 21, title: "Nivel 1: La Roca Fantasma", start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [], dynamicObstacles: () => Math.random() > 0.5 ? [{ x: 2, y: 2 }] : [], hint: "La roca del medio aparece a veces. ¡Usa el Sensor para esquivarla de forma inteligente!", par: 6 },
  { id: 22, title: "Nivel 2: Dos fantasmas", start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [], dynamicObstacles: () => { const obs=[]; if(Math.random()>0.5) obs.push({x:2,y:0}); if(Math.random()>0.5) obs.push({x:4,y:0}); return obs; }, par: 7 },
  { id: 23, title: "Nivel 3: El pasillo embrujado", start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2},{x:4,y:2},{x:5,y:2}], dynamicObstacles: () => Math.random() > 0.5 ? [{ x: 3, y: 3 }] : [], par: 6 },
  { id: 24, title: "Nivel 4: Bajada peligrosa", start: { x: 2, y: 0 }, goal: { x: 2, y: 5 }, obstacles: [], dynamicObstacles: () => Math.random() > 0.5 ? [{ x: 2, y: 2 }] : [{ x: 2, y: 4 }], par: 6 },
  { id: 25, title: "Nivel 5: Espejismo", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{x:1,y:0},{x:2,y:1},{x:3,y:2}], dynamicObstacles: () => Math.random() > 0.5 ? [{ x: 4, y: 3 }] : [{ x: 5, y: 4 }], par: 8 },
  { id: 26, title: "Nivel 6: Campo minado", start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [], dynamicObstacles: () => { const obs=[]; if(Math.random()>0.5) obs.push({x:1,y:0}); if(Math.random()>0.5) obs.push({x:2,y:0}); if(Math.random()>0.5) obs.push({x:3,y:0}); return obs; }, par: 7 },
  { id: 27, title: "Nivel 7: Zigzag mágico", start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{x:1,y:5},{x:3,y:3}], dynamicObstacles: () => Math.random() > 0.5 ? [{ x: 2, y: 4 }] : [{ x: 4, y: 2 }], par: 8 },
  { id: 28, title: "Nivel 8: El bloque central", start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{x:2,y:1},{x:2,y:3}], dynamicObstacles: () => Math.random() > 0.5 ? [{ x: 2, y: 2 }] : [], par: 6 },
  { id: 29, title: "Nivel 9: El laberinto cambiante", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{x:1,y:1},{x:2,y:2},{x:4,y:4}], dynamicObstacles: () => Math.random() > 0.5 ? [{ x: 0, y: 1 }, {x: 5, y: 4}] : [{ x: 1, y: 0 }, {x: 4, y: 5}], par: 10 },
  { id: 30, title: "Nivel 10: La prueba final", start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{x:1,y:2},{x:2,y:2},{x:3,y:2},{x:4,y:2},{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4}], dynamicObstacles: () => { const obs=[]; if(Math.random()>0.5) obs.push({x:1,y:3}); if(Math.random()>0.5) obs.push({x:3,y:3}); return obs; }, hint: "Las rocas pueden bloquear tu camino por arriba o por el centro. Piensa bien.", par: 8 }
];

const SECTION_4_LEVELS = [
  { id: 31, title: "Nivel 1: El Escalón", start: { x: 0, y: 2 }, goal: { x: 4, y: 0 }, obstacles: [{ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 0 }], hint: "Graba el truco 'Arriba y Derecha' y luego úsalo varias veces.", par: 2 },
  { id: 32, title: "Nivel 2: Las 3 fosas", start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 5, y: 1 }, { x: 5, y: 2 }], par: 4 },
  { id: 33, title: "Nivel 3: Patrón Zigzag", start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 5 }, { x: 2, y: 4 }, { x: 3, y: 3 }, { x: 4, y: 2 }], par: 2 },
  { id: 34, title: "Nivel 4: Cuadrados", start: { x: 0, y: 0 }, goal: { x: 4, y: 4 }, obstacles: [{ x: 1, y: 1 }, { x: 3, y: 3 }], par: 4 },
  { id: 35, title: "Nivel 5: Muros Paralelos", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }], par: 5 },
  { id: 36, title: "Nivel 6: Arriba y Abajo", start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{ x: 1, y: 3 }, { x: 3, y: 3 }], par: 4 },
  { id: 37, title: "Nivel 7: El gran salto", start: { x: 0, y: 5 }, goal: { x: 5, y: 1 }, obstacles: [{ x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 2 }], par: 3 },
  { id: 38, title: "Nivel 8: El código secreto", start: { x: 1, y: 1 }, goal: { x: 4, y: 4 }, obstacles: [{ x: 2, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 4 }, { x: 4, y: 3 }], par: 4 },
  { id: 39, title: "Nivel 9: Baile del robot", start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{ x: 1, y: 1 }, { x: 3, y: 3 }], par: 4 },
  { id: 40, title: "Nivel 10: Maestría Abstracción", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 1, y: 0 }, { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 4 }, { x: 5, y: 4 }], par: 3 }
];

const SECTION_5_LEVELS = [
  { id: 41, title: "Nivel 1: El primer engranaje", start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [], items: [{x: 2, y: 2}], laserDoor: {x: 4, y: 2}, hint: "Recoge el engranaje para desactivar la Puerta Láser.", par: 5 },
  { id: 42, title: "Nivel 2: Desvío necesario", start: { x: 0, y: 1 }, goal: { x: 5, y: 1 }, obstacles: [{x: 2, y: 1}, {x: 2, y: 2}], items: [{x: 2, y: 3}], laserDoor: {x: 4, y: 1}, par: 9 },
  { id: 43, title: "Nivel 3: Dos llaves", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{x: 1, y: 0}, {x: 4, y: 5}], items: [{x: 0, y: 5}, {x: 5, y: 0}], laserDoor: {x: 4, y: 4}, par: 12 },
  { id: 44, title: "Nivel 4: Bucle recolector", start: { x: 0, y: 2 }, goal: { x: 5, y: 4 }, obstacles: [{x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3}], items: [{x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}], laserDoor: {x: 5, y: 3}, hint: "Usa un bucle para recoger todos los engranajes en fila.", par: 6 },
  { id: 45, title: "Nivel 5: Laberinto de láseres", start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{x: 1, y: 4}, {x: 3, y: 2}, {x: 3, y: 4}], items: [{x: 0, y: 0}, {x: 2, y: 5}], laserDoor: {x: 4, y: 0}, par: 15 },
  { id: 46, title: "Nivel 6: La trampa", start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [{x: 2, y: 1}, {x: 2, y: 3}, {x: 3, y: 1}, {x: 3, y: 3}], items: [{x: 2, y: 2}], laserDoor: {x: 4, y: 2}, dynamicObstacles: () => Math.random() > 0.5 ? [{ x: 1, y: 2 }] : [], par: 6 },
  { id: 47, title: "Nivel 7: Truco y recolección", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{x: 1, y: 1}, {x: 3, y: 3}], items: [{x: 2, y: 0}, {x: 4, y: 2}, {x: 0, y: 4}], laserDoor: {x: 4, y: 5}, par: 8 },
  { id: 48, title: "Nivel 8: Arriba y abajo", start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{x: 1, y: 3}, {x: 3, y: 3}], items: [{x: 1, y: 1}, {x: 3, y: 5}], laserDoor: {x: 4, y: 3}, par: 12 },
  { id: 49, title: "Nivel 9: Rodeado", start: { x: 2, y: 2 }, goal: { x: 5, y: 5 }, obstacles: [{x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 1, y: 2}, {x: 3, y: 2}, {x: 1, y: 3}, {x: 3, y: 3}], items: [{x: 2, y: 0}, {x: 2, y: 4}], laserDoor: {x: 4, y: 4}, par: 10 },
  { id: 50, title: "Nivel 10: Graduación Robótica", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{x: 1, y: 2}, {x: 2, y: 2}, {x: 4, y: 2}, {x: 4, y: 3}], items: [{x: 0, y: 5}, {x: 5, y: 0}, {x: 0, y: 3}], laserDoor: {x: 5, y: 4}, dynamicObstacles: () => Math.random() > 0.5 ? [{ x: 3, y: 0 }] : [{ x: 0, y: 1 }], par: 14 }
];

const SECTION_6_LEVELS = [
  { id: 51, title: "Nivel 1: Primer Vuelo Libre", start: { x: 0, y: 2 }, goal: { x: 5, y: 2 }, obstacles: [], timeLimit: 15, hint: "¡El robot espera tus órdenes! Presiona 'Activar' y luego usa las flechas para moverlo directo a la meta antes de que acabe el tiempo.", par: 0 }, 
  { id: 52, title: "Nivel 2: Reflejos", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 4, y: 4 }, { x: 4, y: 5 }], timeLimit: 12, par: 0 },
  { id: 53, title: "Nivel 3: El Pasillo Rápido", start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2},{x:4,y:2},{x:5,y:2}, {x:0,y:4},{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},{x:5,y:4}], timeLimit: 8, hint: "Ve lo más rápido que puedas hacia la derecha.", par: 0 },
  { id: 54, title: "Nivel 4: Recolección Contrarreloj", start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [], items: [{x: 0, y: 5}, {x: 5, y: 5}], laserDoor: {x: 4, y: 0}, timeLimit: 15, par: 0 },
  { id: 55, title: "Nivel 5: Laberinto Express", start: { x: 2, y: 2 }, goal: { x: 5, y: 5 }, obstacles: [{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:1,y:2},{x:3,y:2},{x:1,y:3},{x:2,y:3}], timeLimit: 10, par: 0 },
  { id: 56, title: "Nivel 6: Zona de Riesgo", start: { x: 0, y: 5 }, goal: { x: 5, y: 0 }, obstacles: [{x: 1, y: 5}, {x: 2, y: 4}, {x: 3, y: 3}, {x: 4, y: 2}], timeLimit: 12, par: 0 },
  { id: 57, title: "Nivel 7: El Banco de Baterías", start: { x: 0, y: 3 }, goal: { x: 5, y: 3 }, obstacles: [{x:2,y:1},{x:2,y:5}], items: [{x:2,y:0},{x:2,y:2},{x:2,y:4}], laserDoor: {x: 4, y: 3}, timeLimit: 14, par: 0 },
  { id: 58, title: "Nivel 8: Camino Estrecho", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1}, {x:1,y:3},{x:2,y:3},{x:3,y:3},{x:4,y:3},{x:5,y:3}], timeLimit: 15, par: 0 },
  { id: 59, title: "Nivel 9: El Sprint del Capi", start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [{x:2,y:0}, {x:4,y:0}], items: [{x:2,y:5}], laserDoor: {x: 3, y: 0}, timeLimit: 12, par: 0 },
  { id: 60, title: "Nivel 10: Piloto Maestro", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{x:1,y:1},{x:2,y:2},{x:3,y:3},{x:4,y:4}], items: [{x:0,y:5}, {x:5,y:0}], laserDoor: {x: 4, y: 5}, timeLimit: 18, hint: "¡Demuestra tus reflejos para graduarte como Piloto de Drones!", par: 0 }
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
  { emoji: '🦥', price: 50, owned: false }
];

const ROBOT_COLORS = [
  { name: 'Gris Clásico', bg: 'bg-slate-500', border: 'border-slate-600', price: 0, owned: true },
  { name: 'Azul Espacial', bg: 'bg-blue-500', border: 'border-blue-600', price: 0, owned: true },
  { name: 'Rojo Fuego', bg: 'bg-red-500', border: 'border-red-600', price: 5, owned: false },
  { name: 'Verde Tóxico', bg: 'bg-green-500', border: 'border-green-600', price: 10, owned: false },
  { name: 'Morado Láser', bg: 'bg-purple-500', border: 'border-purple-600', price: 15, owned: false },
  { name: 'Oro', bg: 'bg-yellow-400', border: 'border-yellow-500', price: 40, owned: false },
];

export default function App() {
  const [currentView, setCurrentView] = useState('home'); 
  const [currentSection, setCurrentSection] = useState(1);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  
  const [coins, setCoins] = useState(0);
  const [levelStars, setLevelStars] = useState({}); 
  const [shopFaces, setShopFaces] = useState(ROBOT_FACES);
  const [shopColors, setShopColors] = useState(ROBOT_COLORS);
  const [expandedSection, setExpandedSection] = useState(null); 
  
  const [earnedStars, setEarnedStars] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const [robotDesign, setRobotDesign] = useState({ face: shopFaces[0], color: shopColors[0] });

  const currentLevels = 
    currentSection === 1 ? SECTION_1_LEVELS : 
    currentSection === 2 ? SECTION_2_LEVELS : 
    currentSection === 3 ? SECTION_3_LEVELS : 
    currentSection === 4 ? SECTION_4_LEVELS : 
    currentSection === 5 ? SECTION_5_LEVELS : SECTION_6_LEVELS;
  
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
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
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
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
      }
    }
  }, [activeCommandIndex, commands, customTrick, lastEvent]);

  useEffect(() => {
    resetLevel();
  }, [currentLevelIndex, currentSection]);

  const resetLevel = () => {
    setRobotPos(currentLevels[currentLevelIndex].start);
    setEarnedStars(0);
    setEarnedCoins(0);
    setCommands([]);
    setPendingLoop(null);
    setPendingIf(null);
    setStatus('idle');
    setActiveCommandIndex(-1);
    setActiveLoopIteration(-1);
    setLastEvent(null);
    
    setCurrentItems([...(currentLevels[currentLevelIndex].items || [])]);
    setCollectedCount(0);
    
    if (currentLevels[currentLevelIndex].timeLimit) {
      setTimeLeft(currentLevels[currentLevelIndex].timeLimit);
    } else {
      setTimeLeft(null);
    }

    if (currentLevels[currentLevelIndex].dynamicObstacles) {
      setCurrentObstacles(currentLevels[currentLevelIndex].dynamicObstacles());
    } else {
      setCurrentObstacles(currentLevels[currentLevelIndex].obstacles);
    }
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
      setLevelStars({...levelStars, [level.id]: stars});
    }
    setCoins(prev => prev + coinsGained);
  };


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

      if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
        playSound('error');
        setStatus('error');
        return;
      }

      const isDoor = level.laserDoor && nextX === level.laserDoor.x && nextY === level.laserDoor.y;
      const isDoorClosed = isDoor && collectedCount < (level.items ? level.items.length : 0);

      if (isObstacle(nextX, nextY) || isDoorClosed) {
        playSound('error');
        setStatus('error');
        return;
      }

      let newCollectedCount = collectedCount;
      let newItems = [...currentItems];

      const itemIndex = newItems.findIndex(item => item.x === nextX && item.y === nextY);
      if (itemIndex !== -1) {
        playSound('collect');
        newItems.splice(itemIndex, 1);
        newCollectedCount++;
        setCurrentItems(newItems);
        setCollectedCount(newCollectedCount);
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
      if (customTrick.length < 5) {
        setCustomTrick([...customTrick, dir]);
      }
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
      setStatus('idle');
    }
  };

  const removeCommand = (index) => {
    playSound('delete');
    if (status === 'running' || status === 'victory_screen') return;
    const newCommands = [...commands];
    newCommands.splice(index, 1);
    setCommands(newCommands);
  };

  const clearTrick = () => {
    playSound('delete');
    setCustomTrick([]);
  };

  const isObstacle = (x, y) => {
    return currentObstacles.some(obs => obs.x === x && obs.y === y);
  };

  const runProgram = async () => {
    if (status === 'running' || status === 'victory_screen') return;
    playSound('click');

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

    if (level.dynamicObstacles) {
      setCurrentObstacles(level.dynamicObstacles());
    }

    let currentX = level.start.x;
    let currentY = level.start.y;
    let errorOcurred = false;

    await new Promise(resolve => setTimeout(resolve, 800));

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
          const isRockAhead = isObstacle(testX, testY) || testX < 0 || testX >= GRID_SIZE || testY < 0 || testY >= GRID_SIZE || isDoorClosed;
          
          stepsToExecute = [isRockAhead ? cmd.actionDir : cmd.lookDir];
        } else {
          stepsToExecute = [cmd.dir];
        }

        for (let executeDir of stepsToExecute) {
          let nextX = currentX;
          let nextY = currentY;

          if (executeDir === 'UP') nextY -= 1;
          if (executeDir === 'DOWN') nextY += 1;
          if (executeDir === 'LEFT') nextX -= 1;
          if (executeDir === 'RIGHT') nextX += 1;

          if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
            errorOcurred = true;
            break;
          }

          const isDoor = level.laserDoor && nextX === level.laserDoor.x && nextY === level.laserDoor.y;
          const isDoorClosed = isDoor && execCollectedCount < (level.items ? level.items.length : 0);

          if (isObstacle(nextX, nextY) || isDoorClosed) {
            errorOcurred = true;
            break;
          }

          currentX = nextX;
          currentY = nextY;
          setRobotPos({ x: currentX, y: currentY });

          const itemIndex = execItems.findIndex(item => item.x === currentX && item.y === currentY);
          if (itemIndex !== -1) {
            playSound('collect');
            execItems.splice(itemIndex, 1);
            execCollectedCount++;
            setCurrentItems([...execItems]);
            setCollectedCount(execCollectedCount);
          } else {
            playSound('move');
          }
          
          await new Promise(resolve => setTimeout(resolve, 400));
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
    if (currentLevelIndex < currentLevels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    } else {
      setCurrentView('home'); 
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isRobotHere = robotPos.x === x && robotPos.y === y;
        const isGoalHere = level.goal.x === x && level.goal.y === y;
        const isObsHere = isObstacle(x, y);
        const isItemHere = currentItems.some(i => i.x === x && i.y === y);
        
        const isDoorHere = level.laserDoor && level.laserDoor.x === x && level.laserDoor.y === y;
        const totalItems = level.items ? level.items.length : 0;
        const isDoorOpen = collectedCount >= totalItems;

        cells.push(
          <div 
            key={`${x}-${y}`} 
            className={`w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 border-2 rounded-lg flex items-center justify-center text-xl sm:text-2xl relative transition-all duration-300
              ${isObsHere ? 'bg-slate-700 border-slate-800 scale-105 shadow-inner' : 'bg-slate-100 border-slate-300'}
              ${isGoalHere && !isRobotHere && (!isDoorHere || isDoorOpen) ? 'bg-green-100 border-green-400 animate-pulse' : ''}
              ${isDoorHere && !isDoorOpen ? 'bg-red-500/20 border-red-500 overflow-hidden' : ''}
              ${isDoorHere && isDoorOpen ? 'bg-green-500/10 border-green-200' : ''}
            `}
          >
            {isObsHere && '🪨'}
            {isItemHere && <Hexagon className="text-amber-500 fill-amber-400 animate-[spin_4s_linear_infinite] w-6 h-6 sm:w-8 sm:h-8" />}
            
            {isDoorHere && !isDoorOpen && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] absolute top-1/4 animate-pulse"></div>
                <div className="w-full h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] absolute top-2/4 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-full h-1 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] absolute top-3/4 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <Lock size={16} className="text-red-700 z-10 bg-red-100 rounded-full p-0.5" />
              </div>
            )}
            {isDoorHere && isDoorOpen && !isRobotHere && (
              <Unlock size={20} className="text-green-500 opacity-30" />
            )}

            {isGoalHere && !isRobotHere && !isDoorHere && <Battery className="text-green-600 w-6 h-6 sm:w-8 sm:h-8" />}
            {isGoalHere && !isRobotHere && isDoorHere && isDoorOpen && <Battery className="text-green-600 w-6 h-6 sm:w-8 sm:h-8" />}

            {isRobotHere && (
              <div className={`absolute z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-md border-b-4 ${robotDesign.color.bg} ${robotDesign.color.border} ${status === 'running' ? 'scale-110' : 'animate-bounce'}`}>
                {robotDesign.face.emoji}
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  const ArrowIcon = ({ dir, size = 20, className = "" }) => {
    if (dir === 'UP') return <ArrowUp size={size} className={className} />;
    if (dir === 'DOWN') return <ArrowDown size={size} className={className} />;
    if (dir === 'LEFT') return <ArrowLeft size={size} className={className} />;
    if (dir === 'RIGHT') return <ArrowRight size={size} className={className} />;
    if (dir === 'TRICK') return <Sparkles size={size} className={className} />;
    return null;
  };

  const formatDirCode = (dir) => {
    if (!dir) return "";
    return dir.charAt(0) + dir.slice(1).toLowerCase();
  };

  const renderTerminalCode = () => {
    let lines = [];
    let lineNum = 1;

    if (currentSection === 6) {
      lines.push(
        <div key="ev-var" className="px-2 py-0.5 flex items-center border-l-4 border-transparent">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">int</span> <span className="text-blue-300">bateria</span> = <span className="text-orange-300">100</span><span className="text-slate-300">;</span></div>
        </div>
      );
      lines.push(
        <div key="ev-setup-1" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mt-2">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">void</span> <span className="text-pink-300">setup</span><span className="text-slate-300">() {"{"}</span></div>
        </div>
      );
      lines.push(
        <div key="ev-setup-2" className="px-2 py-0.5 flex items-center border-l-4 border-transparent">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div className="ml-4">
            <span className="text-yellow-200">attachInterrupt</span><span className="text-slate-300">(BTN_UP, moveUp, FALLING);</span>
          </div>
        </div>
      );
      lines.push(
        <div key="ev-setup-3" className="px-2 py-0.5 flex items-center border-l-4 border-transparent">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div className="ml-4">
            <span className="text-yellow-200">attachInterrupt</span><span className="text-slate-300">(BTN_DOWN, moveDown, FALLING);</span>
          </div>
        </div>
      );
      lines.push(
        <div key="ev-setup-4" className="px-2 py-0.5 flex items-center border-l-4 border-transparent">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-slate-300">{"}"}</span></div>
        </div>
      );

      lines.push(
        <div key="ev-loop-1" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mt-2">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">void</span> <span className="text-blue-300">loop</span><span className="text-slate-300">() {"{"}</span></div>
        </div>
      );
      lines.push(
        <div key="ev-loop-2" className="px-2 py-0.5 flex items-center border-l-4 border-transparent">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div className="ml-4 text-slate-400">// Modo Control. Esperando...</div>
        </div>
      );
      lines.push(
        <div key="ev-loop-3" className="px-2 py-0.5 flex items-center border-l-4 border-transparent">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-slate-300">{"}"}</span></div>
        </div>
      );

      if (lastEvent) {
        lines.push(
          <div key="ev-act-1" className="px-2 py-0.5 flex items-center border-l-4 border-red-500 bg-white/10 mt-2 event-line">
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div><span className="text-purple-400">void</span> <span className="text-pink-300">move{formatDirCode(lastEvent)}</span><span className="text-slate-300">() {"{"}</span></div>
          </div>
        );
        lines.push(
          <div key="ev-act-2" className="px-2 py-0.5 flex items-center border-l-4 border-red-500 bg-white/10">
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4">
              <span className="text-blue-400">robot</span>.<span className="text-yellow-200">move{formatDirCode(lastEvent)}</span><span className="text-slate-300">();</span>
            </div>
          </div>
        );
        lines.push(
          <div key="ev-act-3" className="px-2 py-0.5 flex items-center border-l-4 border-red-500 bg-white/10">
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div><span className="text-slate-300">{"}"}</span></div>
          </div>
        );
      }
      return lines;
    }

    if (currentSection === 5) {
      lines.push(
        <div key="var-global" className="px-2 py-0.5 flex items-center border-l-4 border-transparent">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">int</span> <span className="text-blue-300">engranajes</span> = <span className="text-orange-300">0</span><span className="text-slate-300">;</span></div>
        </div>
      );
    }

    if (customTrick.length > 0) {
      lines.push(
        <div key="func-start" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mt-1">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">void</span> <span className="text-pink-300">miTruco</span><span className="text-slate-300">() {"{"}</span></div>
        </div>
      );
      
      customTrick.forEach((trickDir, tIdx) => {
        lines.push(
          <div key={`func-${tIdx}`} className="px-2 py-0.5 flex items-center border-l-4 border-transparent">
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4">
              <span className="text-blue-400">robot</span>.<span className="text-yellow-200">move{formatDirCode(trickDir)}</span><span className="text-slate-300">();</span>
            </div>
          </div>
        );
      });

      lines.push(
        <div key="func-end" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mb-1">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-slate-300">{"}"}</span></div>
        </div>
      );
    }

    lines.push(
      <div key="loop-start" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mt-1">
        <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
        <div><span className="text-purple-400">void</span> <span className="text-blue-300">loop</span><span className="text-slate-300">() {"{"}</span></div>
      </div>
    );

    if (commands.length === 0) {
      lines.push(
        <div key="empty" className="px-2 py-0.5 opacity-50 italic flex items-center border-l-4 border-transparent">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <span className="text-slate-400 ml-4">// Esperando código...</span>
        </div>
      );
    }

    commands.forEach((cmd, idx) => {
      const isActive = idx === activeCommandIndex;
      const bgClass = isActive ? 'bg-white/10 border-l-4 border-yellow-400' : 'border-l-4 border-transparent';

      if (cmd.type === 'single') {
        lines.push(
          <div key={`${idx}`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4">
              <span className="text-blue-400">robot</span>.<span className="text-yellow-200">move{formatDirCode(cmd.dir)}</span><span className="text-slate-300">();</span>
            </div>
          </div>
        );
      } else if (cmd.type === 'function') {
        lines.push(
          <div key={`${idx}`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4">
              <span className="text-pink-300">miTruco</span><span className="text-slate-300">();</span>
            </div>
          </div>
        );
      } else if (cmd.type === 'loop') {
        lines.push(
          <div key={`${idx}-1`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4">
              <span className="text-purple-400">for</span> <span className="text-slate-300">(</span><span className="text-blue-400">int</span> i = <span className="text-orange-300">0</span>; i &lt; <span className="text-orange-300">{cmd.times}</span>; i++<span className="text-slate-300">) {"{"}</span>
            </div>
          </div>
        );
        lines.push(
          <div key={`${idx}-2`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-8">
              {cmd.dir === 'TRICK' ? (
                <><span className="text-pink-300">miTruco</span><span className="text-slate-300">();</span></>
              ) : (
                <><span className="text-blue-400">robot</span>.<span className="text-yellow-200">move{formatDirCode(cmd.dir)}</span><span className="text-slate-300">();</span></>
              )}
            </div>
          </div>
        );
        lines.push(
          <div key={`${idx}-3`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4"><span className="text-slate-300">{"}"}</span></div>
          </div>
        );
      } else if (cmd.type === 'if') {
        lines.push(
          <div key={`${idx}-1`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4">
              <span className="text-purple-400">if</span> <span className="text-slate-300">(</span><span className="text-blue-400">sonar</span>.<span className="text-yellow-200">ping_cm</span><span className="text-slate-300">() &lt; </span><span className="text-orange-300">10</span><span className="text-slate-300">) {"{"}</span>
            </div>
          </div>
        );
        lines.push(
          <div key={`${idx}-2`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-8">
              <span className="text-blue-400">robot</span>.<span className="text-yellow-200">move{formatDirCode(cmd.actionDir)}</span><span className="text-slate-300">();</span>
            </div>
          </div>
        );
        lines.push(
          <div key={`${idx}-3`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4">
              <span className="text-slate-300">{"} "}</span><span className="text-purple-400">else</span><span className="text-slate-300"> {"{"}</span>
            </div>
          </div>
        );
        lines.push(
          <div key={`${idx}-4`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-8">
              <span className="text-blue-400">robot</span>.<span className="text-yellow-200">move{formatDirCode(cmd.lookDir)}</span><span className="text-slate-300">();</span>
            </div>
          </div>
        );
        lines.push(
          <div key={`${idx}-5`} className={`px-2 py-0.5 flex items-center ${bgClass} transition-colors`}>
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4"><span className="text-slate-300">{"}"}</span></div>
          </div>
        );
      }
    });

    lines.push(
      <div key="loop-end" className="px-2 py-0.5 flex items-center border-l-4 border-transparent">
        <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
        <div><span className="text-slate-300">{"}"}</span></div>
      </div>
    );

    return lines;
  };

  if (currentView === 'workshop') {
    return (
      <div 
        className="min-h-[100dvh] bg-slate-800 font-sans p-4 flex flex-col items-center justify-start text-white overflow-y-auto"
        style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="absolute right-4 bg-amber-100 text-amber-600 font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border-2 border-amber-300" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
          <Hexagon size={20} className="fill-amber-400" /> {coins}
        </div>

        <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-yellow-400 mt-8">
          <Wrench size={40} /> Taller Premium
        </h1>
        <p className="text-slate-400 mb-8">Usa tus tuercas doradas para comprar nuevas piezas.</p>

        <div className="bg-slate-700 p-8 rounded-3xl shadow-2xl border-4 border-slate-600 w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800 w-32 h-32 rounded-2xl border-4 border-slate-900 flex items-center justify-center shadow-inner relative overflow-hidden">
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-5xl shadow-lg border-b-4 transition-colors duration-300 ${robotDesign.color.bg} ${robotDesign.color.border} animate-pulse`}>
                {robotDesign.face.emoji}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">1. Cabezas</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {shopFaces.map((face, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    if (face.owned) {
                      playSound('click'); setRobotDesign({...robotDesign, face});
                    } else if (coins >= face.price) {
                      playSound('buy');
                      setCoins(c => c - face.price);
                      const newFaces = [...shopFaces];
                      newFaces[i].owned = true;
                      setShopFaces(newFaces);
                      setRobotDesign({...robotDesign, face: newFaces[i]});
                    } else {
                      playSound('error');
                    }
                  }}
                  className={`relative text-3xl w-14 h-14 rounded-xl flex items-center justify-center transition-all 
                    ${robotDesign.face.emoji === face.emoji ? 'bg-yellow-400 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10' : 
                      face.owned ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-800 opacity-60 hover:opacity-100 border border-slate-600'}
                  `}
                >
                  {face.emoji}
                  {!face.owned && (
                    <div className="absolute -bottom-2 bg-slate-900 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-slate-700">
                      <Lock size={8}/> {face.price}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">2. Chasis</h3>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {shopColors.map((color, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    if (color.owned) {
                      playSound('click'); setRobotDesign({...robotDesign, color});
                    } else if (coins >= color.price) {
                      playSound('buy');
                      setCoins(c => c - color.price);
                      const newColors = [...shopColors];
                      newColors[i].owned = true;
                      setShopColors(newColors);
                      setRobotDesign({...robotDesign, color: newColors[i]});
                    } else {
                      playSound('error');
                    }
                  }}
                  className={`relative w-12 h-12 rounded-full border-4 transition-all ${color.bg} 
                    ${robotDesign.color.name === color.name ? 'border-yellow-400 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10' : 
                      color.owned ? 'border-transparent hover:scale-105' : 'border-slate-800 opacity-50 hover:opacity-100'}
                  `}
                  title={color.name}
                >
                   {!color.owned && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-900 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-slate-700 w-max">
                      <Lock size={8}/> {color.price}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => { playSound('click'); setCurrentView('home'); }}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black text-xl py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2"
          >
            <CheckCircle2 /> ¡Volver al Menú!
          </button>
        </div>
      </div>
    );
  }

  const ModuleCard = ({ sectionNum, title, desc, icon: Icon, bgClass, textClass, borderClass }) => {
    const isExpanded = expandedSection === sectionNum;
    const levels = sectionNum === 1 ? SECTION_1_LEVELS : sectionNum === 2 ? SECTION_2_LEVELS : sectionNum === 3 ? SECTION_3_LEVELS : sectionNum === 4 ? SECTION_4_LEVELS : sectionNum === 5 ? SECTION_5_LEVELS : SECTION_6_LEVELS;
    
    const totalStarsPossible = levels.length * 3;
    const starsEarned = levels.reduce((acc, lvl) => acc + (levelStars[lvl.id] || 0), 0);

    return (
      <div className={`bg-white rounded-3xl shadow-lg border-4 ${borderClass} transition-all duration-300 overflow-hidden`}>
        <div 
          onClick={() => { playSound('click'); setExpandedSection(isExpanded ? null : sectionNum); }}
          className="p-6 cursor-pointer flex flex-col sm:flex-row items-center gap-6 group text-center sm:text-left relative"
        >
          <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-xs font-black px-3 py-1 rounded-bl-xl flex items-center gap-1">
             <Star size={12} className="fill-amber-400 text-amber-500" /> {starsEarned}/{totalStarsPossible}
          </div>
          <div className={`${bgClass} ${textClass} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
            <Icon size={40} />
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Módulo {sectionNum}: {title}</h2>
            <p className="text-slate-500 font-medium">{desc}</p>
          </div>
        </div>

        {isExpanded && (
          <div className="bg-slate-50 p-4 border-t-2 border-slate-100 grid grid-cols-5 gap-2">
            {levels.map((lvl, idx) => {
              const stars = levelStars[lvl.id] || 0;
              const isLocked = idx > 0 && !(levelStars[levels[idx-1].id] > 0); 

              return (
                <button
                  key={lvl.id}
                  disabled={isLocked && false} 
                  onClick={() => { 
                    playSound('click'); 
                    setCurrentSection(sectionNum); 
                    setCurrentLevelIndex(idx); 
                    setCurrentView('game'); 
                  }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center font-bold text-lg border-b-4 transition-transform active:scale-95
                    ${stars > 0 ? `${bgClass} ${textClass} border-${textClass.split('-')[1]}-300` : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100'}
                  `}
                >
                  {idx + 1}
                  <div className="flex mt-1">
                    {[1,2,3].map(s => (
                      <Star key={s} size={8} className={s <= stars ? "fill-amber-400 text-amber-500" : "fill-slate-200 text-slate-300"} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (currentView === 'home') {
    return (
      <div 
        className="min-h-[100dvh] bg-slate-50 font-sans p-4 flex flex-col items-center"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}
      >
        
        <div className="absolute right-4 bg-amber-100 text-amber-600 font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-amber-300 z-10" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
          <Hexagon size={20} className="fill-amber-400" /> {coins}
        </div>

        <header className="text-center mt-12 mb-8 w-full max-w-2xl relative">
          <h1 className="text-4xl font-black text-indigo-900 tracking-tight mb-3 flex items-center justify-center gap-3">
            🚀 Academia Capi-bot
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-md mx-auto mb-6">
            Elige tu módulo y gana tuercas completando niveles con código perfecto.
          </p>

          <div 
            onClick={() => { playSound('click'); setCurrentView('workshop'); }}
            className="bg-slate-800 text-white rounded-2xl p-4 shadow-lg border-2 border-slate-700 cursor-pointer transform transition-all hover:scale-[1.02] flex items-center justify-between group mx-auto w-full"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-b-2 ${robotDesign.color.bg} ${robotDesign.color.border}`}>
                {robotDesign.face.emoji}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-yellow-400 flex items-center gap-2">
                  <ShoppingCart size={18} /> Taller y Tienda
                </h3>
                <p className="text-sm text-slate-300">¡Gasta tus tuercas en nuevos aspectos!</p>
              </div>
            </div>
            <div className="bg-slate-700 p-2 rounded-full text-slate-300 group-hover:bg-yellow-500 group-hover:text-slate-900 transition-colors">
              <ChevronLeft size={20} className="rotate-180" />
            </div>
          </div>
        </header>

        <div className="w-full max-w-2xl flex flex-col gap-4">
          <ModuleCard sectionNum={1} title="Primeros Pasos" desc="Aprende secuencias usando la memoria." icon={Play} bgClass="bg-indigo-100" textClass="text-indigo-600" borderClass="border-indigo-100" />
          <ModuleCard sectionNum={2} title="Bucles Mágicos" desc="Repite acciones para ahorrar código." icon={Repeat} bgClass="bg-purple-100" textClass="text-purple-600" borderClass="border-purple-100" />
          <ModuleCard sectionNum={3} title="Decisiones (Sensor)" desc="Haz que tu robot evite rocas fantasma." icon={Cpu} bgClass="bg-orange-100" textClass="text-orange-600" borderClass="border-orange-100" />
          <ModuleCard sectionNum={4} title="Funciones (Trucos)" desc="Graba combinaciones para saltar muros." icon={Sparkles} bgClass="bg-pink-100" textClass="text-pink-600" borderClass="border-pink-100" />
          <ModuleCard sectionNum={5} title="Variables (Mochila)" desc="Recolecta para apagar láseres." icon={Archive} bgClass="bg-teal-100" textClass="text-teal-600" borderClass="border-teal-100" />
          <ModuleCard sectionNum={6} title="Control Remoto" desc="Pilota en vivo y esquiva obstáculos rápidos." icon={Gamepad2} bgClass="bg-red-100" textClass="text-red-600" borderClass="border-red-100" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[100dvh] bg-sky-50 font-sans p-2 sm:p-4 flex flex-col items-center relative overflow-x-hidden touch-manipulation"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      
      {status === 'victory_screen' && (
        <div 
          className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl transform animate-[bounce_0.5s_ease-out]">
            <h2 className="text-4xl font-black text-indigo-900 mb-2">¡Nivel Superado!</h2>
            <div className="flex justify-center gap-2 mb-6 mt-4">
              {[1, 2, 3].map(star => (
                <Star 
                  key={star} 
                  size={60} 
                  className={`transition-all duration-500 delay-${star*100} ${star <= earnedStars ? 'fill-amber-400 text-amber-500 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'fill-slate-200 text-slate-300'}`} 
                />
              ))}
            </div>
            
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6 inline-block">
              <span className="text-amber-800 font-bold text-lg flex items-center gap-2">
                Recompensa: <Hexagon className="fill-amber-400 text-amber-500"/> +{earnedCoins} Tuercas
              </span>
            </div>
            
            <p className="text-slate-500 mb-8 italic">
              {earnedStars === 3 ? "¡Código perfecto! No desperdiciaste memoria." : `Puedes hacerlo en ${level.par} bloques o menos para ganar 3 estrellas.`}
            </p>

            <div className="flex gap-4">
              <button onClick={() => { playSound('click'); resetLevel(); }} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-colors">Reintentar</button>
              <button onClick={() => { playSound('click'); nextLevel(); }} className="flex-[2] bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl shadow-lg transition-transform active:scale-95">Siguiente Nivel</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl flex justify-between items-center mb-3 sm:mb-6">
        <button 
          onClick={() => { playSound('click'); setCurrentView('home'); }}
          className="flex items-center gap-1 sm:gap-2 text-sky-700 hover:text-sky-900 font-bold bg-white/60 hover:bg-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-sm border-2 border-transparent hover:border-sky-200 text-sm sm:text-base"
        >
          <ChevronLeft size={20} /> <span className="hidden sm:inline">Mapa</span>
        </button>
        
        <div className="flex items-center gap-2 sm:gap-4">
           <div className="bg-amber-100 text-amber-600 font-black px-2 py-1 sm:px-3 sm:py-1 rounded-full flex items-center gap-1 shadow-sm border border-amber-300 text-xs sm:text-sm">
            <Hexagon size={14} className="fill-amber-400" /> {coins}
          </div>
          <div className="text-right">
            <h1 className="text-lg sm:text-2xl font-black text-sky-900 tracking-tight leading-none">
              Módulo {currentSection}
            </h1>
            <p className="text-[10px] sm:text-sm text-slate-500 font-medium line-clamp-1 max-w-[150px] sm:max-w-none">Nivel {currentLevelIndex + 1}: {level.title.split(': ')[1] || level.title}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full max-w-6xl justify-center items-center lg:items-start flex-1">
        
        <div className="flex flex-col items-center w-full lg:w-auto bg-white p-3 sm:p-6 rounded-3xl shadow-xl border-4 border-sky-100 shrink-0">
          
          <div className="mb-4 text-center h-10 flex items-center justify-center w-full relative">
            
            {level.items && status !== 'success' && status !== 'error' && (
              <div className="absolute left-0 flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                <Settings size={18} className="text-amber-500 animate-[spin_4s_linear_infinite]" />
                <span className="font-bold text-slate-700 font-mono text-sm">{collectedCount} / {level.items.length}</span>
              </div>
            )}

            {currentSection === 6 && timeLeft !== null && status !== 'success' && status !== 'error' && (
              <div className={`absolute right-0 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm font-bold font-mono text-sm border transition-colors ${timeLeft <= 5 ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 'bg-slate-800 text-green-400 border-slate-700'}`}>
                <Timer size={18} /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </div>
            )}

            {currentSection !== 6 && status !== 'victory_screen' && (
               <div className="absolute right-0 flex items-center gap-1 text-xs font-bold text-slate-400">
                Óptimo: {level.par} <Star size={10} className="fill-amber-400 text-amber-500"/>
              </div>
            )}

            {status === 'error' && (
              <span className="text-red-500 font-bold flex items-center gap-2 text-xl bg-red-50 px-4 py-2 rounded-full shadow-sm border border-red-200">
                <AlertTriangle /> {timeLeft === 0 ? "¡Batería agotada!" : "¡Auch! Revisa tu ruta."}
              </span>
            )}
            {status === 'running' && currentSection !== 6 && (
              <span className="text-blue-500 font-bold text-xl animate-pulse flex items-center gap-2">
                <Cpu className="animate-spin" /> Procesando...
              </span>
            )}
            {status === 'running' && currentSection === 6 && (
              <span className="text-red-500 font-bold text-xl animate-pulse flex items-center gap-2">
                <RadioReceiver className="animate-pulse" /> RECIBIENDO EVENTOS
              </span>
            )}
            {status === 'idle' && level.hint && (
              <span className="text-amber-600 font-bold text-sm bg-amber-50 px-4 py-2 rounded-full shadow-sm border border-amber-200 flex items-center gap-2 max-w-xs text-center leading-tight">
                <HelpCircle size={20} className="shrink-0"/> {level.hint}
              </span>
            )}
          </div>

          <div className="grid gap-1 mb-6" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
            {renderGrid()}
          </div>

          <div className="w-full mt-2 flex flex-col items-center">
            <div className="w-full max-w-[320px] sm:max-w-[380px] bg-[#1e1e1e] rounded-xl shadow-inner overflow-hidden font-mono text-[10px] sm:text-[11px] border border-slate-700 text-left opacity-80 hover:opacity-100 transition-opacity">
              <div className="bg-[#2d2d2d] px-3 py-1 flex items-center justify-between border-b border-black/40">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-yellow-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="text-slate-400 text-[9px] font-bold font-sans tracking-widest uppercase">robot.ino</div>
                <div className="w-10"></div>
              </div>
              <div id="terminal-container" className="py-2 text-slate-300 h-24 overflow-y-auto scroll-smooth custom-scrollbar">
                {renderTerminalCode()}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-white p-4 sm:p-6 rounded-3xl shadow-xl border-4 border-indigo-100 flex flex-col flex-1 min-h-[300px] lg:min-h-full">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4 border-b-2 border-indigo-100 pb-2 flex justify-between items-center">
            {currentSection === 6 ? "Control Remoto" : "Memoria Central"}
          </h2>
          
          {currentSection === 2 && (
            <div className="mb-4 bg-purple-50 p-3 rounded-xl border-2 border-purple-200">
              <h3 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-1"><Repeat size={16} /> Bucle (Repetir)</h3>
              {pendingLoop ? (
                <div className="text-purple-600 font-bold text-sm text-center animate-pulse py-1">
                  ¡Selecciona una flecha para repetir!
                  <button onClick={() => { playSound('click'); setPendingLoop(null); }} className="ml-2 text-red-500 underline text-xs">Cancelar</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { playSound('click'); setPendingLoop(2); }} className="flex-1 bg-purple-200 hover:bg-purple-300 text-purple-800 font-bold py-2 rounded-lg active:scale-95">x2</button>
                  <button onClick={() => { playSound('click'); setPendingLoop(3); }} className="flex-1 bg-purple-200 hover:bg-purple-300 text-purple-800 font-bold py-2 rounded-lg active:scale-95">x3</button>
                  <button onClick={() => { playSound('click'); setPendingLoop(4); }} className="flex-1 bg-purple-200 hover:bg-purple-300 text-purple-800 font-bold py-2 rounded-lg active:scale-95">x4</button>
                </div>
              )}
            </div>
          )}

          {currentSection === 3 && (
            <div className="mb-4 bg-orange-50 p-3 rounded-xl border-2 border-orange-200">
              <h3 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-1"><Cpu size={16} /> Sensor (Decisión)</h3>
              {pendingIf ? (
                <div className="text-orange-700 font-bold text-sm text-center bg-white p-2 rounded-lg shadow-sm border border-orange-200">
                  {pendingIf.step === 1 ? "1. ¿Qué dirección miras? 👁️" : "2. ¿Hacia dónde esquivas? 🏃"}
                  <button onClick={() => { playSound('click'); setPendingIf(null); }} className="block mt-1 mx-auto text-red-500 underline text-xs">Cancelar</button>
                </div>
              ) : (
                <button 
                  onClick={() => { playSound('click'); setPendingIf({ step: 1, lookDir: null }); }} 
                  className="w-full bg-orange-200 hover:bg-orange-300 text-orange-900 font-bold py-2 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <HelpCircle size={18} /> Instalar Sensor
                </button>
              )}
            </div>
          )}

          {currentSection === 4 && (
            <div className="mb-4 bg-pink-50 p-3 rounded-xl border-2 border-pink-200">
              <h3 className="text-sm font-bold text-pink-800 mb-2 flex items-center gap-1"><Sparkles size={16} /> Crear Truco (Función)</h3>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { playSound('click'); setIsRecordingTrick(!isRecordingTrick); }} 
                  className={`w-full font-bold py-2 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${isRecordingTrick ? 'bg-red-200 text-red-900' : 'bg-pink-200 hover:bg-pink-300 text-pink-900'}`}
                >
                  <CircleDot size={18} className={isRecordingTrick ? 'animate-pulse text-red-600' : ''} /> 
                  {isRecordingTrick ? "⏹️ Detener Grabación" : "🔴 Grabar Truco"}
                </button>

                <div className="bg-white/60 p-2 rounded-lg flex items-center justify-between min-h-[44px]">
                  <div className="flex gap-1 flex-wrap">
                    {customTrick.length === 0 ? (
                      <span className="text-xs text-pink-500/70 italic">Truco vacío...</span>
                    ) : (
                      customTrick.map((dir, idx) => (
                        <div key={idx} className="bg-white border border-pink-200 p-1 rounded text-pink-700">
                          <ArrowIcon dir={dir} size={14} />
                        </div>
                      ))
                    )}
                  </div>
                  {customTrick.length > 0 && !isRecordingTrick && (
                    <button onClick={clearTrick} className="text-red-400 hover:text-red-600 ml-2" title="Borrar Truco"><Trash2 size={16}/></button>
                  )}
                </div>

                {!isRecordingTrick && customTrick.length > 0 && (
                  <button 
                    onClick={addTrickCommand}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Sparkles size={16} /> Usar Truco
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
            <button onClick={() => handleArrowClick('UP')} className={`btn-command hover:bg-blue-200 border-2 rounded-xl p-3 font-bold flex flex-col items-center justify-center transition-transform active:scale-95 ${currentSection === 6 && status === 'running' ? 'bg-red-100 border-red-400 text-red-800 shadow-[0_0_15px_rgba(248,113,113,0.5)]' : isRecordingTrick ? 'bg-pink-100 border-pink-300 text-pink-800' : 'bg-blue-100 border-blue-300 text-blue-800'}`}><ArrowUp size={32} /> Arriba</button>
            <button onClick={() => handleArrowClick('DOWN')} className={`btn-command hover:bg-blue-200 border-2 rounded-xl p-3 font-bold flex flex-col items-center justify-center transition-transform active:scale-95 ${currentSection === 6 && status === 'running' ? 'bg-red-100 border-red-400 text-red-800 shadow-[0_0_15px_rgba(248,113,113,0.5)]' : isRecordingTrick ? 'bg-pink-100 border-pink-300 text-pink-800' : 'bg-blue-100 border-blue-300 text-blue-800'}`}><ArrowDown size={32} /> Abajo</button>
            <button onClick={() => handleArrowClick('LEFT')} className={`btn-command hover:bg-blue-200 border-2 rounded-xl p-3 font-bold flex flex-col items-center justify-center transition-transform active:scale-95 ${currentSection === 6 && status === 'running' ? 'bg-red-100 border-red-400 text-red-800 shadow-[0_0_15px_rgba(248,113,113,0.5)]' : isRecordingTrick ? 'bg-pink-100 border-pink-300 text-pink-800' : 'bg-blue-100 border-blue-300 text-blue-800'}`}><ArrowLeft size={32} /> Izquierda</button>
            <button onClick={() => handleArrowClick('RIGHT')} className={`btn-command hover:bg-blue-200 border-2 rounded-xl p-3 font-bold flex flex-col items-center justify-center transition-transform active:scale-95 ${currentSection === 6 && status === 'running' ? 'bg-red-100 border-red-400 text-red-800 shadow-[0_0_15px_rgba(248,113,113,0.5)]' : isRecordingTrick ? 'bg-pink-100 border-pink-300 text-pink-800' : 'bg-blue-100 border-blue-300 text-blue-800'}`}><ArrowRight size={32} /> Derecha</button>
          </div>

          {currentSection !== 6 ? (
            <div className={`flex-grow rounded-xl border-2 p-4 mb-6 min-h-[100px] max-h-[140px] overflow-y-auto transition-colors ${isRecordingTrick ? 'bg-slate-200 border-slate-300 opacity-50 pointer-events-none' : 'bg-slate-50 border-slate-200'}`}>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                Bloques: {commands.length}/24
                {commands.length > 0 && (
                  <button onClick={() => { playSound('delete'); setCommands([]); }} className="text-red-400 hover:text-red-600 transition-colors" title="Borrar todo"><Trash2 size={18} /></button>
                )}
              </h3>
              
              {commands.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center text-sm italic">
                  No hay instrucciones.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {commands.map((cmd, index) => {
                    const isActive = index === activeCommandIndex;

                    if (cmd.type === 'loop') {
                      return (
                        <div key={index} onClick={() => removeCommand(index)} className={`relative flex items-center gap-1 px-2 py-1 rounded-lg shadow-sm cursor-pointer border-2 transition-all ${isActive ? 'bg-purple-400 border-purple-500 scale-105 shadow-md' : 'bg-purple-100 border-purple-300 hover:border-red-400 hover:bg-red-50'}`}>
                          <span className={`font-black text-sm ${isActive ? 'text-white' : 'text-purple-800'}`}>x{cmd.times}</span>
                          <div className={`p-1 rounded bg-white/50 ${isActive ? 'animate-pulse' : ''}`}><ArrowIcon dir={cmd.dir} size={16} className={cmd.dir === 'TRICK' ? "text-pink-600" : "text-slate-800"} /></div>
                          {isActive && activeLoopIteration > 0 && <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-purple-700 bg-white px-1 rounded shadow">{activeLoopIteration}/{cmd.times}</span>}
                        </div>
                      );
                    }

                    if (cmd.type === 'if') {
                      return (
                        <div key={index} onClick={() => removeCommand(index)} className={`relative flex items-center gap-1 px-2 py-1 rounded-lg shadow-sm cursor-pointer border-2 transition-all ${isActive ? 'bg-orange-400 border-orange-500 scale-105 shadow-md' : 'bg-orange-100 border-orange-300 hover:border-red-400 hover:bg-red-50'}`}>
                          <div className="flex items-center gap-1 bg-white/60 p-1 rounded">
                            <ArrowIcon dir={cmd.lookDir} size={14} className="text-orange-900" />
                            <span className="text-xs">🪨?</span>
                          </div>
                          <ArrowRight size={12} className={isActive ? 'text-white' : 'text-orange-600'} />
                          <div className={`p-1 rounded bg-white/60 ${isActive ? 'animate-pulse' : ''}`}>
                            <ArrowIcon dir={cmd.actionDir} size={16} className="text-orange-900" />
                          </div>
                        </div>
                      );
                    }

                    if (cmd.type === 'function') {
                       return (
                        <div key={index} onClick={() => removeCommand(index)} className={`relative flex items-center justify-center w-10 h-10 rounded-lg shadow-sm cursor-pointer border-2 transition-all ${isActive ? 'bg-pink-400 border-pink-500 scale-110 shadow-md' : 'bg-pink-100 border-pink-300 hover:border-red-400 hover:bg-red-50'}`}>
                          <Sparkles className={isActive ? 'text-white' : 'text-pink-600'} size={20} />
                          <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={index} onClick={() => removeCommand(index)} className={`relative flex items-center justify-center w-10 h-10 rounded-lg shadow-sm cursor-pointer border-2 transition-all ${isActive ? 'bg-yellow-400 border-yellow-500 scale-110 shadow-md' : 'bg-white border-slate-300 hover:border-red-400 hover:bg-red-50'}`}>
                        <ArrowIcon dir={cmd.dir} className={isActive ? 'text-white' : 'text-slate-700'} />
                        <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow bg-slate-800 rounded-xl border-4 border-slate-900 p-4 mb-6 min-h-[100px] flex flex-col items-center justify-center text-center">
              <RadioReceiver size={32} className={status === 'running' ? 'text-red-500 animate-pulse mb-2' : 'text-slate-600 mb-2'} />
              <p className="text-slate-400 text-xs sm:text-sm">
                {status === 'running' ? "¡Conexión establecida!" : "Presiona 'Activar' para conectar."}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-auto">
            <button onClick={() => { playSound('click'); resetLevel(); }} disabled={(status === 'running' || status === 'victory_screen') && currentSection !== 6} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-2 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"><RotateCcw size={20} /> Reset</button>
            <button 
              onClick={runProgram} 
              disabled={(commands.length === 0 && currentSection !== 6) || status === 'running' || status === 'victory_screen'} 
              className={`flex-[2] text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 ${currentSection === 6 ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/30' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'}`}
            >
              {currentSection === 6 ? (
                <><Gamepad2 size={24} /> ACTIVAR</>
              ) : (
                <><Play size={24} /> EJECUTAR</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}