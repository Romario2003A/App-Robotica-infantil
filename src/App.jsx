import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RotateCcw, Trash2, Battery, AlertTriangle, CheckCircle2, Lock, Unlock, ChevronLeft, Repeat, Wrench, Cpu, HelpCircle, Terminal, Sparkles, CircleDot, Settings, Archive, Gamepad2, Timer, RadioReceiver, Star, Hexagon, ShoppingCart, Info, ChevronRight, X } from 'lucide-react';

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
    console.error("Audio no soportado", e);
  }
};

// --- NIVELES ---
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
  { id: 59, title: "Nivel 9: El Sprint de LogiRom", start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, obstacles: [{x:2,y:0}, {x:4,y:0}], items: [{x:2,y:5}], laserDoor: {x: 3, y: 0}, timeLimit: 12, par: 0 },
  { id: 60, title: "Nivel 10: Piloto Maestro", start: { x: 0, y: 0 }, goal: { x: 5, y: 5 }, obstacles: [{x:1,y:1},{x:2,y:2},{x:3,y:3},{x:4,y:4}], items: [{x:0,y:5}, {x:5,y:0}], laserDoor: {x: 4, y: 5}, timeLimit: 18, hint: "¡Demuestra tus reflejos para graduarte como Piloto de Drones!", par: 0 }
];

const GRID_SIZE = 6;

// Estilos Premium para los colores (Degradados en lugar de colores planos)
const ROBOT_FACES = [
  { emoji: '🤖', price: 0, owned: true }, { emoji: '👽', price: 0, owned: true }, 
  { emoji: '👾', price: 10, owned: false }, { emoji: '👻', price: 15, owned: false }, 
  { emoji: '🐶', price: 20, owned: false }, { emoji: '🦊', price: 20, owned: false }, 
  { emoji: '🐸', price: 20, owned: false }, { emoji: '🐹', price: 30, owned: false }, 
  { emoji: '🦫', price: 30, owned: false }, { emoji: '🦥', price: 50, owned: false }
];

const ROBOT_COLORS = [
  { name: 'Platino', bg: 'bg-gradient-to-br from-slate-300 to-slate-500', border: 'border-slate-400', price: 0, owned: true },
  { name: 'Océano', bg: 'bg-gradient-to-br from-blue-400 to-blue-600', border: 'border-blue-400', price: 0, owned: true },
  { name: 'Magma', bg: 'bg-gradient-to-br from-red-400 to-rose-600', border: 'border-red-400', price: 5, owned: false },
  { name: 'Neón', bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', border: 'border-emerald-400', price: 10, owned: false },
  { name: 'Galaxia', bg: 'bg-gradient-to-br from-purple-400 to-indigo-600', border: 'border-purple-400', price: 15, owned: false },
  { name: 'Corona', bg: 'bg-gradient-to-br from-yellow-300 to-amber-500', border: 'border-amber-300', price: 40, owned: false },
];

// --- DIAPOSITIVAS DEL ONBOARDING ---
const ONBOARDING_SLIDES = [
  {
    title: "¡Bienvenido a LogiRom!",
    desc: "Descubre el fascinante mundo de la programación guiando a tu robot explorador en 60 increíbles misiones.",
    icon: Sparkles,
    color: "text-indigo-500",
    bgIcon: "bg-indigo-100",
    border: "border-indigo-200"
  },
  {
    title: "Aprende Lógica Real",
    desc: "Usa secuencias, bucles y sensores. Verás cómo tus instrucciones se traducen a código de C++ (Arduino) en tiempo real.",
    icon: Terminal,
    color: "text-emerald-500",
    bgIcon: "bg-emerald-100",
    border: "border-emerald-200"
  },
  {
    title: "Gana Recompensas",
    desc: "Completa los niveles usando la menor cantidad de bloques para ganar 3 estrellas y obtener Tuercas Doradas.",
    icon: Hexagon,
    color: "text-amber-500",
    bgIcon: "bg-amber-100",
    border: "border-amber-200"
  },
  {
    title: "Personaliza tu Compañero",
    desc: "Visita la Tienda Premium y usa tus tuercas para desbloquear colores especiales y el legendario módulo Capi-bot.",
    icon: ShoppingCart,
    color: "text-rose-500",
    bgIcon: "bg-rose-100",
    border: "border-rose-200"
  }
];

export default function App() {
  // Verificamos si es la primera vez que entra a la app revisando el localStorage
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('logirom_has_seen_onboarding') ? 'landing' : 'onboarding';
  }); 
  const [currentSlide, setCurrentSlide] = useState(0); // Controla en qué diapositiva vamos

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
    if (currentView === 'game') {
        resetLevel();
    }
  }, [currentLevelIndex, currentSection, currentView]);

  const completeOnboarding = () => {
    playSound('click');
    localStorage.setItem('logirom_has_seen_onboarding', 'true');
    setCurrentView('landing');
  };

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

    const boardArea = document.getElementById('game-board-area');
    if (boardArea) {
      boardArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

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
            className={`w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl relative transition-all duration-300
              ${isObsHere ? 'bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] scale-[1.02] z-0' : 'bg-slate-50 shadow-inner border-2 border-slate-200 hover:bg-slate-100 transition-colors z-0'}
              ${isGoalHere && !isRobotHere && (!isDoorHere || isDoorOpen) ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300 animate-pulse shadow-[inset_0_0_20px_rgba(52,211,153,0.2)]' : ''}
              ${isDoorHere && !isDoorOpen ? 'bg-red-500/10 border-red-400 overflow-hidden' : ''}
              ${isDoorHere && isDoorOpen ? 'bg-green-500/5 border-green-200' : ''}
            `}
          >
            {isObsHere && '🪨'}
            {isItemHere && <Hexagon className="text-amber-500 fill-amber-400 animate-[spin_4s_linear_infinite] w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />}
            
            {isDoorHere && !isDoorOpen && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-full h-[3px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] absolute top-1/4 animate-pulse"></div>
                <div className="w-full h-[3px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] absolute top-2/4 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-full h-[3px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] absolute top-3/4 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <Lock size={16} className="text-red-700 z-10 bg-white/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm border border-red-200" />
              </div>
            )}
            {isDoorHere && isDoorOpen && !isRobotHere && (
              <Unlock size={20} className="text-green-500/40" />
            )}

            {isGoalHere && !isRobotHere && !isDoorHere && <Battery className="text-emerald-500 w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />}
            {isGoalHere && !isRobotHere && isDoorHere && isDoorOpen && <Battery className="text-emerald-500 w-6 h-6 sm:w-8 sm:h-8 drop-shadow-md" />}

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
        <div key="ev-var" className="px-2 py-0.5 flex items-center border-l-4 border-transparent hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">int</span> <span className="text-blue-300">bateria</span> = <span className="text-orange-300">100</span><span className="text-slate-300">;</span></div>
        </div>
      );
      lines.push(
        <div key="ev-setup-1" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mt-2 hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">void</span> <span className="text-pink-300">setup</span><span className="text-slate-300">() {"{"}</span></div>
        </div>
      );
      lines.push(
        <div key="ev-setup-2" className="px-2 py-0.5 flex items-center border-l-4 border-transparent hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div className="ml-4">
            <span className="text-yellow-200">attachInterrupt</span><span className="text-slate-300">(BTN_UP, moveUp, FALLING);</span>
          </div>
        </div>
      );
      lines.push(
        <div key="ev-setup-3" className="px-2 py-0.5 flex items-center border-l-4 border-transparent hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div className="ml-4">
            <span className="text-yellow-200">attachInterrupt</span><span className="text-slate-300">(BTN_DOWN, moveDown, FALLING);</span>
          </div>
        </div>
      );
      lines.push(
        <div key="ev-setup-4" className="px-2 py-0.5 flex items-center border-l-4 border-transparent hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-slate-300">{"}"}</span></div>
        </div>
      );

      lines.push(
        <div key="ev-loop-1" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mt-2 hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">void</span> <span className="text-blue-300">loop</span><span className="text-slate-300">() {"{"}</span></div>
        </div>
      );
      lines.push(
        <div key="ev-loop-2" className="px-2 py-0.5 flex items-center border-l-4 border-transparent hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div className="ml-4 text-slate-400">// Modo Control. Esperando...</div>
        </div>
      );
      lines.push(
        <div key="ev-loop-3" className="px-2 py-0.5 flex items-center border-l-4 border-transparent hover:bg-white/5 transition-colors">
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
        <div key="var-global" className="px-2 py-0.5 flex items-center border-l-4 border-transparent hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">int</span> <span className="text-blue-300">engranajes</span> = <span className="text-orange-300">0</span><span className="text-slate-300">;</span></div>
        </div>
      );
    }

    if (customTrick.length > 0) {
      lines.push(
        <div key="func-start" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mt-1 hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-purple-400">void</span> <span className="text-pink-300">miTruco</span><span className="text-slate-300">() {"{"}</span></div>
        </div>
      );
      
      customTrick.forEach((trickDir, tIdx) => {
        lines.push(
          <div key={`func-${tIdx}`} className="px-2 py-0.5 flex items-center border-l-4 border-transparent hover:bg-white/5 transition-colors">
            <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
            <div className="ml-4">
              <span className="text-blue-400">robot</span>.<span className="text-yellow-200">move{formatDirCode(trickDir)}</span><span className="text-slate-300">();</span>
            </div>
          </div>
        );
      });

      lines.push(
        <div key="func-end" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mb-1 hover:bg-white/5 transition-colors">
          <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
          <div><span className="text-slate-300">{"}"}</span></div>
        </div>
      );
    }

    lines.push(
      <div key="loop-start" className="px-2 py-0.5 flex items-center border-l-4 border-transparent mt-1 hover:bg-white/5 transition-colors">
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
      const bgClass = isActive ? 'bg-white/10 border-l-4 border-yellow-400 shadow-[inset_0_0_10px_rgba(250,204,21,0.2)]' : 'border-l-4 border-transparent hover:bg-white/5';

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
      <div key="loop-end" className="px-2 py-0.5 flex items-center border-l-4 border-transparent hover:bg-white/5 transition-colors">
        <span className="text-slate-600 w-6 text-right mr-4 select-none">{lineNum++}</span>
        <div><span className="text-slate-300">{"}"}</span></div>
      </div>
    );

    return lines;
  };

  if (currentView === 'onboarding') {
    const slide = ONBOARDING_SLIDES[currentSlide];
    const isLast = currentSlide === ONBOARDING_SLIDES.length - 1;
    const Icon = slide.icon;

    return (
      <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-black font-sans flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decoraciones de fondo premium (Neón difuminado) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Botón de Omitir (Sólo si no es la última) */}
        {!isLast && (
           <button 
             onClick={completeOnboarding}
             className="absolute top-8 right-8 text-slate-400 hover:text-white font-bold flex items-center gap-1 transition-colors"
           >
             Omitir <X size={18}/>
           </button>
        )}

        <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-8 max-w-sm w-[90%] text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 relative z-10">
          <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 ${slide.bgIcon} ${slide.color} border-4 border-white shadow-lg rounded-3xl flex items-center justify-center transform transition-transform hover:scale-105`}>
               <Icon size={48} />
            </div>
          </div>
          
          <h2 className={`text-2xl font-black ${slide.color} tracking-tight mb-3`}>{slide.title}</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 h-20">
            {slide.desc}
          </p>

          {/* Puntos de navegación */}
          <div className="flex justify-center gap-2 mb-8">
            {ONBOARDING_SLIDES.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              playSound('click');
              if (isLast) {
                completeOnboarding();
              } else {
                setCurrentSlide(prev => prev + 1);
              }
            }}
            className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-indigo-600 hover:to-purple-700 text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-700"
          >
            {isLast ? "¡Comenzar la Aventura!" : <>Siguiente <ChevronRight size={20} /></>}
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <div 
        className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-black font-sans flex flex-col items-center justify-center relative overflow-hidden selection:bg-indigo-500/30"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Decoraciones de fondo premium (Neón difuminado) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Círculo giratorio sutil de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(99,102,241,0.1)_360deg)] animate-[spin_10s_linear_infinite] pointer-events-none rounded-full"></div>

        <div className="z-10 flex flex-col items-center text-center p-6 max-w-lg w-full">
          
          {/* Ícono de entrada animado */}
          <div className="w-32 h-32 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.2)] flex items-center justify-center text-6xl mb-8 animate-[bounce_4s_ease-in-out_infinite] relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[2rem]"></div>
            <span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10">{robotDesign.face.emoji}</span>
          </div>

          {/* Etiqueta superior */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 font-bold text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-6 shadow-sm backdrop-blur-sm">
            <Sparkles size={14} /> Entorno Educativo
          </div>

          {/* Título Principal */}
          <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 mb-6 pb-3 tracking-tight drop-shadow-sm">
            LogiRom
          </h1>
          
          {/* Subtítulo */}
          <p className="text-lg sm:text-xl text-slate-400 font-medium mb-12 leading-relaxed px-4">
            Domina el pensamiento computacional y programa tu propio robot explorador.
          </p>

          {/* Botón Call to Action */}
          <button
            onClick={() => { playSound('click'); setCurrentView('home'); }}
            className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-black text-white text-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] active:scale-95 border border-indigo-400/50 overflow-hidden"
          >
            {/* Efecto de brillo (shine) al pasar el ratón */}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>
            <span className="relative flex items-center justify-center gap-3 tracking-wide">
              <Play className="fill-white drop-shadow-md" size={24} /> ENTRAR A LA ACADEMIA
            </span>
          </button>
        </div>

        {/* Footer/Créditos */}
        <div className="absolute bottom-8 text-slate-500/60 text-xs sm:text-sm font-bold tracking-widest uppercase">
          Creado por <span className="text-indigo-400/80">Guedson Romario</span>
        </div>
      </div>
    );
  }

  if (currentView === 'workshop') {
    return (
      <div 
        className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black font-sans p-4 flex flex-col items-center justify-start text-white overflow-y-auto"
        style={{ paddingTop: 'max(3rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="absolute right-4 bg-amber-400/10 backdrop-blur-md text-amber-400 font-black px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.2)] border border-amber-400/30" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
          <Hexagon size={20} className="fill-amber-400" /> {coins}
        </div>

        <h1 className="text-4xl font-black mb-2 flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mt-8 drop-shadow-sm tracking-tight pb-2">
          <Wrench size={40} className="text-yellow-400" /> Taller Premium
        </h1>
        <p className="text-slate-400 mb-8 font-medium">Usa tus tuercas doradas para desbloquear tecnología.</p>

        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/10 w-full max-w-md">
          <div className="flex justify-center mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
            <div className="bg-slate-900/80 backdrop-blur-md w-32 h-32 rounded-3xl border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-lg border-b-[3px] border-white/20 transition-all duration-300 ${robotDesign.color.bg} animate-pulse`}>
                <span className="drop-shadow-md">{robotDesign.face.emoji}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Módulo de Cabeza</h3>
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
                  className={`relative text-3xl w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${robotDesign.face.emoji === face.emoji ? 'bg-gradient-to-b from-yellow-300 to-amber-500 scale-110 shadow-[0_10px_20px_rgba(251,191,36,0.4)] z-10 border-none' : 
                      face.owned ? 'bg-slate-800/80 hover:bg-slate-700 border border-slate-700 shadow-sm' : 'bg-slate-900/50 opacity-70 hover:opacity-100 border border-slate-800'}
                  `}
                >
                  <span className="drop-shadow-sm">{face.emoji}</span>
                  {!face.owned && (
                    <div className="absolute -bottom-2 bg-slate-800 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-500/30 shadow-lg">
                      <Lock size={10} className="text-amber-500/70"/> {face.price}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Pintura de Chasis</h3>
            <div className="flex flex-wrap gap-4 justify-center">
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
                  className={`relative w-12 h-12 rounded-full transition-all duration-300 ${color.bg} shadow-inner
                    ${robotDesign.color.name === color.name ? 'scale-110 shadow-[0_10px_20px_rgba(255,255,255,0.2)] z-10 ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-800' : 
                      color.owned ? 'hover:scale-105 border-2 border-white/10' : 'opacity-40 hover:opacity-80 border-2 border-transparent'}
                  `}
                  title={color.name}
                >
                   {!color.owned && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-800 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-500/30 shadow-lg w-max">
                      <Lock size={10} className="text-amber-500/70"/> {color.price}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => { playSound('click'); setCurrentView('home'); }}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-lg py-4 rounded-2xl shadow-[0_10px_20px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2 border border-indigo-400/50"
          >
            <CheckCircle2 /> Equipar y Volver
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'about') {
    return (
      <div 
        className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-200 font-sans p-4 flex flex-col items-center justify-center selection:bg-indigo-100 relative"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 mb-6 pb-2 text-center relative z-10 tracking-tight">Sobre el Proyecto</h2>
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mb-4 shadow-[0_10px_20px_rgba(99,102,241,0.3)] border-4 border-white flex items-center justify-center text-4xl transform transition-transform hover:scale-110 hover:rotate-3 cursor-default">
              👨‍💻
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-1">Guedson Romario Quispe Anchaise</h3>
            <p className="text-indigo-600 font-bold text-sm mb-4 leading-tight">
              Estudiante de Ingeniería de Sistemas <br/>
              <span className="text-slate-500 text-[10px] uppercase tracking-widest">Universidad Continental - Sede Arequipa</span>
            </p>
            
            <p className="text-slate-600 text-sm mb-6 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner">
              "LogiRom" es un proyecto educativo diseñado para enseñar a niños los fundamentos del pensamiento computacional y la robótica a través de una interfaz interactiva y código real.
            </p>
            
            <div className="w-full bg-white p-4 rounded-2xl border border-slate-100 mb-8 text-left shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Detalles Técnicos</p>
                <ul className="text-sm text-slate-600 space-y-2 font-medium">
                  <li className="flex justify-between"><span>Versión:</span> <span className="font-bold text-slate-800">1.0.0 Premium</span></li>
                  <li className="flex justify-between"><span>Tecnologías:</span> <span className="font-bold text-slate-800">React & Tailwind CSS</span></li>
                  <li className="flex justify-between"><span>Lógica Core:</span> <span className="font-bold text-slate-800">C++ Simulado</span></li>
                </ul>
            </div>
            
            <button
              onClick={() => { playSound('click'); setCurrentView('home'); }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-600"
            >
              <ChevronLeft size={20} /> Volver al Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ModuleCard = ({ sectionNum, title, desc, icon: Icon, bgGradient, textClass, ringClass }) => {
    const isExpanded = expandedSection === sectionNum;
    const levels = sectionNum === 1 ? SECTION_1_LEVELS : sectionNum === 2 ? SECTION_2_LEVELS : sectionNum === 3 ? SECTION_3_LEVELS : sectionNum === 4 ? SECTION_4_LEVELS : sectionNum === 5 ? SECTION_5_LEVELS : SECTION_6_LEVELS;
    
    const totalStarsPossible = levels.length * 3;
    const starsEarned = levels.reduce((acc, lvl) => acc + (levelStars[lvl.id] || 0), 0);

    return (
      <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white transition-all duration-500 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${isExpanded ? `ring-2 ${ringClass} ring-offset-4 ring-offset-slate-50` : ''}`}>
        <div 
          onClick={() => { playSound('click'); setExpandedSection(isExpanded ? null : sectionNum); }}
          className="p-6 cursor-pointer flex flex-col sm:flex-row items-center gap-6 group text-center sm:text-left relative"
        >
          <div className="absolute top-4 right-4 bg-white shadow-sm border border-slate-100 text-slate-600 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5">
             <Star size={14} className="fill-amber-400 text-amber-500 drop-shadow-sm" /> {starsEarned}/{totalStarsPossible}
          </div>
          <div className={`w-16 h-16 flex items-center justify-center rounded-2xl text-white shadow-lg ${bgGradient} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <Icon size={32} />
          </div>
          <div className="flex-1 w-full pt-2 sm:pt-0">
            <h2 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">Módulo {sectionNum}: {title}</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">{desc}</p>
          </div>
        </div>

        {/* Acordeón de Niveles (Premium Design) */}
        <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-slate-50/50 p-6 border-t border-slate-100 grid grid-cols-5 gap-3">
            {levels.map((lvl, idx) => {
              const stars = levelStars[lvl.id] || 0;
              // El bloqueo ahora es 100% real. El nivel está bloqueado si no es el primero y el anterior no tiene estrellas.
              const isLocked = idx > 0 && !(levelStars[levels[idx-1].id] > 0); 

              return (
                <button
                  key={lvl.id}
                  disabled={isLocked}
                  onClick={() => { 
                    playSound('click'); 
                    setCurrentSection(sectionNum); 
                    setCurrentLevelIndex(idx); 
                    setCurrentView('game'); 
                  }}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center font-black text-xl transition-all duration-300 ${!isLocked ? 'active:scale-90' : ''}
                    ${stars > 0 ? `${bgGradient} text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:-translate-y-1` : 
                      isLocked ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed opacity-70' : 
                      'bg-white text-slate-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'}
                  `}
                >
                  {idx + 1}
                  <div className="flex mt-1 h-3 items-center justify-center gap-0.5">
                    {isLocked ? (
                      <Lock size={14} className="text-slate-400/50" />
                    ) : (
                      [1,2,3].map(s => (
                        <Star key={s} size={10} className={s <= stars ? "fill-amber-300 text-amber-300 drop-shadow-sm" : "fill-slate-200/50 text-transparent"} />
                      ))
                    )}
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
      <div 
        className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-200 font-sans p-4 flex flex-col items-center selection:bg-indigo-100 relative"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}
      >
        
        {/* Botón de Información del Desarrollador */}
        <button 
          onClick={() => { playSound('click'); setCurrentView('about'); }}
          className="absolute left-4 bg-white/80 hover:bg-white backdrop-blur-md text-indigo-600 p-2.5 rounded-full flex items-center justify-center shadow-[0_4px_14px_0_rgba(99,102,241,0.15)] border border-indigo-100 z-10 transition-all hover:scale-110 active:scale-95" 
          style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
          title="Sobre el Proyecto"
        >
          <Info size={22} />
        </button>

        <div className="absolute right-4 bg-white/80 backdrop-blur-md text-amber-600 font-black px-5 py-2.5 rounded-full flex items-center gap-2 shadow-[0_4px_14px_0_rgba(251,191,36,0.15)] border border-amber-200 z-10" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
          <Hexagon size={20} className="fill-amber-400 drop-shadow-sm" /> {coins}
        </div>

        <header className="text-center mt-12 mb-10 w-full max-w-2xl relative">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-indigo-100/50 border border-indigo-200 text-indigo-700 font-bold text-xs tracking-widest uppercase shadow-sm">
            Entorno de Aprendizaje
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-indigo-900 tracking-tight mb-6 pb-2">
            Academia LogiRom
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
            Domina la lógica de programación y gana tuercas completando misiones.
          </p>

          <div 
            onClick={() => { playSound('click'); setCurrentView('workshop'); }}
            className="bg-white/80 backdrop-blur-lg rounded-[2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white cursor-pointer transform transition-all duration-300 hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] hover:-translate-y-1 flex items-center justify-between group mx-auto w-full"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border-b-2 border-white/30 ${robotDesign.color.bg}`}>
                <span className="drop-shadow-md">{robotDesign.face.emoji}</span>
              </div>
              <div className="text-left">
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2 tracking-tight">
                  <ShoppingCart size={18} className="text-indigo-500" /> Tienda Premium
                </h3>
                <p className="text-sm text-slate-500 font-medium">Personaliza tu compañero</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-sm">
              <ChevronLeft size={20} className="rotate-180" />
            </div>
          </div>
        </header>

        <div className="w-full max-w-2xl flex flex-col gap-5 relative z-0">
          <ModuleCard sectionNum={1} title="Secuencias" desc="Aprende instrucciones básicas de memoria." icon={Play} bgGradient="bg-gradient-to-br from-blue-500 to-indigo-600" ringClass="ring-indigo-200" />
          <ModuleCard sectionNum={2} title="Bucles Mágicos" desc="Repite acciones para ahorrar código." icon={Repeat} bgGradient="bg-gradient-to-br from-purple-500 to-fuchsia-600" ringClass="ring-purple-200" />
          <ModuleCard sectionNum={3} title="Sensor Óptico" desc="Usa condicionales para esquivar rocas." icon={Cpu} bgGradient="bg-gradient-to-br from-orange-400 to-rose-500" ringClass="ring-orange-200" />
          <ModuleCard sectionNum={4} title="Funciones" desc="Graba combinaciones en botones." icon={Sparkles} bgGradient="bg-gradient-to-br from-pink-400 to-rose-600" ringClass="ring-pink-200" />
          <ModuleCard sectionNum={5} title="Mochila Lógica" desc="Usa variables para abrir puertas láser." icon={Archive} bgGradient="bg-gradient-to-br from-teal-400 to-emerald-600" ringClass="ring-teal-200" />
          <ModuleCard sectionNum={6} title="Modo en Vivo" desc="Maneja interrupciones asíncronas." icon={Gamepad2} bgGradient="bg-gradient-to-br from-red-500 to-rose-700" ringClass="ring-red-200" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[100dvh] bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50 font-sans p-2 sm:p-4 flex flex-col items-center relative overflow-x-hidden touch-manipulation"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      
      {status === 'victory_screen' && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform animate-[scale-in_0.3s_ease-out]">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-4 -mt-16">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 mb-2 pb-1 tracking-tight">¡Misión Cumplida!</h2>
            
            <div className="flex justify-center gap-3 mb-6 mt-4">
              {[1, 2, 3].map(star => (
                <Star 
                  key={star} 
                  size={50} 
                  className={`transition-all duration-700 delay-${star*150} ${star <= earnedStars ? 'fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'fill-slate-200 text-slate-200'}`} 
                />
              ))}
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6 inline-flex shadow-sm">
              <span className="text-amber-800 font-black text-lg flex items-center gap-2 tracking-tight">
                <Hexagon className="fill-amber-400 text-amber-500 drop-shadow-sm"/> +{earnedCoins} Tuercas
              </span>
            </div>
            
            <p className="text-slate-500 font-medium mb-8 text-sm px-4">
              {earnedStars === 3 ? "¡Código perfecto! Eficiencia máxima." : `Optimizalo en ${level.par} bloques para ganar 3 estrellas.`}
            </p>

            <div className="flex gap-3">
              <button onClick={() => { playSound('click'); resetLevel(); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition-colors border border-slate-200">Reintentar</button>
              <button onClick={() => { playSound('click'); nextLevel(); }} className="flex-[2] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black py-3.5 rounded-xl shadow-[0_8px_20px_rgba(99,102,241,0.3)] transition-all active:scale-95 border border-indigo-400/50">Siguiente</button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl flex justify-between items-center mb-4 sm:mb-6">
        <button 
          onClick={() => { playSound('click'); setCurrentView('home'); }}
          className="flex items-center gap-1 sm:gap-2 text-slate-600 hover:text-indigo-600 font-bold bg-white/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.03)] border border-white transition-all text-sm sm:text-base hover:shadow-[0_4px_14px_0_rgba(99,102,241,0.1)]"
        >
          <ChevronLeft size={20} /> <span className="hidden sm:inline">Mapa Central</span>
        </button>
        
        <div className="flex items-center gap-3 sm:gap-5">
           <div className="bg-white/80 backdrop-blur-md text-amber-600 font-black px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-amber-200 text-xs sm:text-sm">
            <Hexagon size={16} className="fill-amber-400 drop-shadow-sm" /> {coins}
          </div>
          <div className="text-right">
            <h1 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight leading-none">
              Módulo {currentSection}
            </h1>
            <p className="text-[10px] sm:text-sm text-indigo-500 font-bold line-clamp-1 max-w-[150px] sm:max-w-none">Nivel {currentLevelIndex + 1}: {level.title.split(': ')[1] || level.title}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full max-w-5xl justify-center items-center lg:items-start flex-1">
        
        {/* PANEL IZQUIERDO: Tablero Premium */}
        <div id="game-board-area" className="flex flex-col items-center w-full lg:w-auto bg-white/70 backdrop-blur-2xl p-4 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white shrink-0 scroll-mt-4">
          
          <div className="mb-5 text-center h-10 flex items-center justify-center w-full relative">
            
            {level.items && status !== 'success' && status !== 'error' && (
              <div className="absolute left-0 flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                <Settings size={18} className="text-amber-500 animate-[spin_4s_linear_infinite]" />
                <span className="font-black text-slate-700 font-mono text-sm">{collectedCount} <span className="text-slate-400">/</span> {level.items.length}</span>
              </div>
            )}

            {currentSection === 6 && timeLeft !== null && status !== 'success' && status !== 'error' && (
              <div className={`absolute right-0 flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-inner font-black font-mono text-sm border transition-colors ${timeLeft <= 5 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-800 text-emerald-400 border-slate-700'}`}>
                <Timer size={18} className={timeLeft <= 5 ? 'text-red-500' : 'text-emerald-500'} /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
              </div>
            )}

            {currentSection !== 6 && status !== 'victory_screen' && (
               <div className="absolute right-0 flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                Par: {level.par} <Star size={12} className="fill-amber-400 text-amber-500 drop-shadow-sm"/>
              </div>
            )}

            {status === 'error' && (
              <span className="text-rose-600 font-bold flex items-center gap-2 text-lg sm:text-xl bg-rose-50 px-4 py-2 rounded-2xl shadow-sm border border-rose-200 animate-bounce">
                <AlertTriangle size={24} /> {timeLeft === 0 ? "¡Batería agotada!" : "Error de lógica"}
              </span>
            )}
            {status === 'running' && currentSection !== 6 && (
              <span className="text-indigo-600 font-black text-lg sm:text-xl flex items-center gap-2 bg-indigo-50 px-5 py-2 rounded-2xl border border-indigo-100 shadow-sm">
                <Cpu className="animate-spin text-indigo-500" size={24} /> Ejecutando...
              </span>
            )}
            {status === 'running' && currentSection === 6 && (
              <span className="text-rose-500 font-black text-lg sm:text-xl flex items-center gap-2 bg-rose-50 px-5 py-2 rounded-2xl border border-rose-100 shadow-sm">
                <RadioReceiver className="animate-pulse" size={24} /> SEÑAL EN VIVO
              </span>
            )}
            {status === 'idle' && level.hint && (
              <span className="text-amber-700 font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 rounded-2xl shadow-sm border border-amber-200/50 flex items-center gap-2 max-w-xs text-left leading-tight">
                <HelpCircle size={20} className="shrink-0 text-amber-500"/> {level.hint}
              </span>
            )}
          </div>

          <div className="bg-slate-100/50 p-2 sm:p-3 rounded-2xl border border-slate-200/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
            <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
              {renderGrid()}
            </div>
          </div>

          <div className="w-full mt-5 flex flex-col items-center">
            <div className="w-full max-w-[320px] sm:max-w-[380px] bg-slate-900 rounded-2xl shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] overflow-hidden font-mono text-[10px] sm:text-[11px] border border-slate-700 text-left">
              <div className="bg-slate-800 px-4 py-1.5 flex items-center justify-between border-b border-slate-950/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="text-slate-400 text-[9px] font-black font-sans tracking-widest uppercase opacity-80">robot.cpp</div>
                <div className="w-10"></div>
              </div>
              <div id="terminal-container" className="py-2 text-slate-300 h-28 overflow-y-auto scroll-smooth custom-scrollbar opacity-90 hover:opacity-100 transition-opacity">
                {renderTerminalCode()}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: Programación Premium */}
        <div className="w-full lg:w-96 bg-white/70 backdrop-blur-2xl p-5 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col flex-1 min-h-[300px] lg:min-h-full">
          <h2 className="text-xl font-black text-slate-800 mb-5 flex justify-between items-center tracking-tight">
            {currentSection === 6 ? "Control Remoto" : "Consola de Comandos"}
            <span className="bg-indigo-50 text-indigo-500 text-[10px] uppercase tracking-widest px-2 py-1 rounded-md border border-indigo-100">Live</span>
          </h2>
          
          {currentSection === 2 && (
            <div className="mb-4 bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4 rounded-2xl border border-purple-100 shadow-sm">
              <h3 className="text-sm font-black text-purple-800 mb-3 flex items-center gap-1.5"><Repeat size={16} /> Bucle (For)</h3>
              {pendingLoop ? (
                <div className="text-purple-600 font-bold text-sm text-center animate-pulse py-1">
                  Selecciona acción a repetir...
                  <button onClick={() => { playSound('click'); setPendingLoop(null); }} className="ml-2 text-rose-500 underline decoration-rose-300 text-xs">Cancelar</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { playSound('click'); setPendingLoop(2); }} className="flex-1 bg-white hover:bg-purple-600 text-purple-600 hover:text-white font-black py-2.5 rounded-xl border border-purple-200 hover:border-purple-600 transition-all shadow-sm active:scale-95">x2</button>
                  <button onClick={() => { playSound('click'); setPendingLoop(3); }} className="flex-1 bg-white hover:bg-purple-600 text-purple-600 hover:text-white font-black py-2.5 rounded-xl border border-purple-200 hover:border-purple-600 transition-all shadow-sm active:scale-95">x3</button>
                  <button onClick={() => { playSound('click'); setPendingLoop(4); }} className="flex-1 bg-white hover:bg-purple-600 text-purple-600 hover:text-white font-black py-2.5 rounded-xl border border-purple-200 hover:border-purple-600 transition-all shadow-sm active:scale-95">x4</button>
                </div>
              )}
            </div>
          )}

          {currentSection === 3 && (
            <div className="mb-4 bg-gradient-to-r from-orange-50 to-rose-50 p-4 rounded-2xl border border-orange-100 shadow-sm">
              <h3 className="text-sm font-black text-orange-800 mb-3 flex items-center gap-1.5"><Cpu size={16} /> Sensor Óptico (If/Else)</h3>
              {pendingIf ? (
                <div className="text-orange-700 font-bold text-sm text-center bg-white p-3 rounded-xl shadow-sm border border-orange-200">
                  {pendingIf.step === 1 ? "1. ¿Dirección a vigilar? 👁️" : "2. ¿Hacia dónde evadir? 🏃"}
                  <button onClick={() => { playSound('click'); setPendingIf(null); }} className="block mt-2 mx-auto text-rose-500 underline decoration-rose-300 text-xs">Cancelar Sensor</button>
                </div>
              ) : (
                <button 
                  onClick={() => { playSound('click'); setPendingIf({ step: 1, lookDir: null }); }} 
                  className="w-full bg-white hover:bg-orange-500 text-orange-600 hover:text-white font-black py-3 rounded-xl border border-orange-200 hover:border-orange-500 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  <HelpCircle size={18} /> Activar Lógica
                </button>
              )}
            </div>
          )}

          {currentSection === 4 && (
            <div className="mb-4 bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-100 shadow-sm">
              <h3 className="text-sm font-black text-pink-800 mb-3 flex items-center gap-1.5"><Sparkles size={16} /> Función (Void)</h3>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { playSound('click'); setIsRecordingTrick(!isRecordingTrick); }} 
                  className={`w-full font-black py-3 rounded-xl transition-all shadow-sm active:scale-95 border flex items-center justify-center gap-2 ${isRecordingTrick ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-white hover:bg-pink-500 text-pink-600 hover:text-white border-pink-200 hover:border-pink-500'}`}
                >
                  <CircleDot size={18} className={isRecordingTrick ? 'animate-pulse text-rose-500' : ''} /> 
                  {isRecordingTrick ? "⏹️ Detener" : "🔴 Grabar Macro"}
                </button>

                <div className="bg-white p-2 rounded-xl flex items-center justify-between min-h-[48px] border border-pink-100 shadow-inner">
                  <div className="flex gap-1.5 flex-wrap px-1">
                    {customTrick.length === 0 ? (
                      <span className="text-xs text-pink-400 font-medium italic">Macro vacía...</span>
                    ) : (
                      customTrick.map((dir, idx) => (
                        <div key={idx} className="bg-pink-50 border border-pink-200 p-1.5 rounded-lg text-pink-600 shadow-sm">
                          <ArrowIcon dir={dir} size={14} />
                        </div>
                      ))
                    )}
                  </div>
                  {customTrick.length > 0 && !isRecordingTrick && (
                    <button onClick={clearTrick} className="text-rose-400 hover:text-rose-600 p-2" title="Borrar Macro"><Trash2 size={16}/></button>
                  )}
                </div>

                {!isRecordingTrick && customTrick.length > 0 && (
                  <button 
                    onClick={addTrickCommand}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black py-3 rounded-xl shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] transition-all active:scale-95 flex items-center justify-center gap-2 border border-indigo-400/50"
                  >
                    <Sparkles size={18} /> Inyectar Macro
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5 mt-auto">
            <button onClick={() => handleArrowClick('UP')} className={`btn-command relative overflow-hidden bg-white shadow-[0_4px_10px_rgba(0,0,0,0.06)] border text-slate-600 rounded-2xl p-4 font-black flex flex-col items-center justify-center transition-all active:scale-90 ${currentSection === 6 && status === 'running' ? 'border-rose-400 text-rose-600 hover:bg-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : isRecordingTrick ? 'border-pink-300 text-pink-600 hover:bg-pink-50' : 'border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'}`}><ArrowUp size={28} className="mb-1 drop-shadow-sm" /> Arriba</button>
            <button onClick={() => handleArrowClick('DOWN')} className={`btn-command relative overflow-hidden bg-white shadow-[0_4px_10px_rgba(0,0,0,0.06)] border text-slate-600 rounded-2xl p-4 font-black flex flex-col items-center justify-center transition-all active:scale-90 ${currentSection === 6 && status === 'running' ? 'border-rose-400 text-rose-600 hover:bg-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : isRecordingTrick ? 'border-pink-300 text-pink-600 hover:bg-pink-50' : 'border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'}`}><ArrowDown size={28} className="mb-1 drop-shadow-sm" /> Abajo</button>
            <button onClick={() => handleArrowClick('LEFT')} className={`btn-command relative overflow-hidden bg-white shadow-[0_4px_10px_rgba(0,0,0,0.06)] border text-slate-600 rounded-2xl p-4 font-black flex flex-col items-center justify-center transition-all active:scale-90 ${currentSection === 6 && status === 'running' ? 'border-rose-400 text-rose-600 hover:bg-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : isRecordingTrick ? 'border-pink-300 text-pink-600 hover:bg-pink-50' : 'border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'}`}><ArrowLeft size={28} className="mb-1 drop-shadow-sm" /> Izquierda</button>
            <button onClick={() => handleArrowClick('RIGHT')} className={`btn-command relative overflow-hidden bg-white shadow-[0_4px_10px_rgba(0,0,0,0.06)] border text-slate-600 rounded-2xl p-4 font-black flex flex-col items-center justify-center transition-all active:scale-90 ${currentSection === 6 && status === 'running' ? 'border-rose-400 text-rose-600 hover:bg-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : isRecordingTrick ? 'border-pink-300 text-pink-600 hover:bg-pink-50' : 'border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'}`}><ArrowRight size={28} className="mb-1 drop-shadow-sm" /> Derecha</button>
          </div>

          {currentSection !== 6 ? (
            <div className={`flex-grow rounded-2xl p-4 mb-6 min-h-[120px] max-h-[160px] overflow-y-auto transition-all duration-300 shadow-inner ${isRecordingTrick ? 'bg-slate-100 border border-slate-200 opacity-60 pointer-events-none' : 'bg-slate-50 border border-slate-200'}`}>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] mb-3 flex justify-between items-center">
                RAM: {commands.length}/24
                {commands.length > 0 && (
                  <button onClick={() => { playSound('delete'); setCommands([]); }} className="text-rose-400 hover:text-rose-600 transition-colors bg-white p-1.5 rounded-lg shadow-sm border border-rose-100" title="Borrar todo"><Trash2 size={14} /></button>
                )}
              </h3>
              
              {commands.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center text-sm font-medium">
                  Memoria vacía.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {commands.map((cmd, index) => {
                    const isActive = index === activeCommandIndex;

                    if (cmd.type === 'loop') {
                      return (
                        <div key={index} onClick={() => removeCommand(index)} className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl cursor-pointer border transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 border-purple-400 scale-105 shadow-md' : 'bg-white border-purple-200 hover:border-rose-300 hover:bg-rose-50 shadow-sm'}`}>
                          <span className={`font-black text-sm ${isActive ? 'text-white' : 'text-purple-600'}`}>x{cmd.times}</span>
                          <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20 animate-pulse text-white' : 'bg-purple-50 text-purple-700'}`}><ArrowIcon dir={cmd.dir} size={14} className={cmd.dir === 'TRICK' ? (isActive ? "text-white" : "text-pink-500") : ""} /></div>
                          {isActive && activeLoopIteration > 0 && <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-[9px] font-black text-purple-700 bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-purple-100">{activeLoopIteration}/{cmd.times}</span>}
                        </div>
                      );
                    }

                    if (cmd.type === 'if') {
                      return (
                        <div key={index} onClick={() => removeCommand(index)} className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-pointer border transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-orange-400 to-rose-500 border-orange-300 scale-105 shadow-md text-white' : 'bg-white border-orange-200 hover:border-rose-300 hover:bg-rose-50 shadow-sm text-orange-600'}`}>
                          <div className={`flex items-center gap-1 p-1 rounded-lg ${isActive ? 'bg-white/20' : 'bg-orange-50'}`}>
                            <ArrowIcon dir={cmd.lookDir} size={12} />
                            <span className="text-[10px] font-black">🪨?</span>
                          </div>
                          <ArrowRight size={10} className={isActive ? 'text-white/70' : 'text-orange-300'} />
                          <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20 animate-pulse' : 'bg-orange-50'}`}>
                            <ArrowIcon dir={cmd.actionDir} size={14} />
                          </div>
                        </div>
                      );
                    }

                    if (cmd.type === 'function') {
                       return (
                        <div key={index} onClick={() => removeCommand(index)} className={`relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer border transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-pink-400 to-rose-500 border-pink-300 scale-110 shadow-md' : 'bg-white border-pink-200 hover:border-rose-300 hover:bg-rose-50 shadow-sm'}`}>
                          <Sparkles className={isActive ? 'text-white' : 'text-pink-500'} size={18} />
                          <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm">{index + 1}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={index} onClick={() => removeCommand(index)} className={`relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer border transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-yellow-400 to-amber-500 border-amber-300 scale-110 shadow-md' : 'bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50 shadow-sm'}`}>
                        <ArrowIcon dir={cmd.dir} className={isActive ? 'text-white drop-shadow-sm' : 'text-slate-600'} size={20} />
                        <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm">{index + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow bg-slate-900 rounded-2xl border-2 border-slate-800 p-5 mb-6 min-h-[120px] flex flex-col items-center justify-center text-center shadow-[inset_0_5px_20px_rgba(0,0,0,0.5)]">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-xl ${status === 'running' ? 'bg-rose-500/30' : 'bg-transparent'}`}></div>
                <RadioReceiver size={36} className={`relative z-10 ${status === 'running' ? 'text-rose-500 animate-pulse' : 'text-slate-600'}`} />
              </div>
              <p className={`font-black text-sm mt-3 tracking-wide ${status === 'running' ? 'text-rose-400' : 'text-slate-500'}`}>
                {status === 'running' ? "CONEXIÓN ESTABLECIDA" : "ESPERANDO SEÑAL"}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-auto">
            <button onClick={() => { playSound('click'); resetLevel(); }} disabled={(status === 'running' || status === 'victory_screen') && currentSection !== 6} className="flex-1 bg-white hover:bg-slate-50 text-slate-600 font-black py-4 px-2 rounded-2xl flex items-center justify-center gap-2 transition-all border border-slate-200 shadow-sm disabled:opacity-50 active:scale-95 text-sm sm:text-base"><RotateCcw size={18} /> Reset</button>
            <button 
              onClick={runProgram} 
              disabled={(commands.length === 0 && currentSection !== 6) || status === 'running' || status === 'victory_screen'} 
              className={`flex-[2] text-white font-black py-4 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all border disabled:opacity-50 active:scale-95 text-sm sm:text-base ${currentSection === 6 ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_8px_20px_rgba(225,29,72,0.3)] border-rose-400/50' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-[0_8px_20px_rgba(99,102,241,0.3)] border-indigo-400/50'}`}
            >
              {currentSection === 6 ? (
                <><Gamepad2 size={20} /> INICIAR VUELO</>
              ) : (
                <><Play size={20} className="fill-current" /> COMPILAR</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}