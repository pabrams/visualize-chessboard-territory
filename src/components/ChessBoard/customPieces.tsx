import React from 'react';
import { PieceRenderObject } from 'react-chessboard';

// Two-tone colors for white pieces (using red)
const WHITE_MAIN = '#ff0040';
const WHITE_ACCENT = '#aa0033';

// Two-tone neon colors for black pieces (using blue)
const BLACK_MAIN = '#0088ff';
const BLACK_ACCENT = '#0044bb';

const TRANSPARENT = 'none';
const STROKE_WIDTH = '2';

export const customPieces: PieceRenderObject = {
  wP: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-wP">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <path
        d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 H 34 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
        style={{
          fill: TRANSPARENT,
          stroke: WHITE_MAIN,
          strokeWidth: STROKE_WIDTH,
          strokeLinecap: 'round',
          strokeLinejoin: 'miter',
          filter: 'url(#dropShadow-wP)',
        }}
      />
    </svg>
  ),
  wR: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-wR">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinecap: 'round', strokeLinejoin: 'round', filter: 'url(#dropShadow-wR)' }}>
        <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z " style={{ stroke: WHITE_MAIN }} />
        <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z " style={{ stroke: WHITE_MAIN }} />
        <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" style={{ stroke: WHITE_MAIN }} />
        <path d="M 34,14 L 31,17 L 14,17 L 11,14" style={{ stroke: WHITE_MAIN }} />
        <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" style={{ stroke: WHITE_MAIN }} />
        <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" style={{ stroke: WHITE_MAIN }} />
        <path d="M 11,14 L 34,14" style={{ stroke: WHITE_ACCENT }} />
      </g>
    </svg>
  ),
  wN: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-wN">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinecap: 'round', strokeLinejoin: 'round' , filter: 'url(#dropShadow-wN)'}}>
        <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style={{ stroke: WHITE_MAIN }} />
        <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" style={{ stroke: WHITE_MAIN }} />
        <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" style={{ fill: WHITE_ACCENT, stroke: WHITE_ACCENT }} />
        <path d="M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style={{ fill: WHITE_ACCENT, stroke: WHITE_ACCENT }} />
      </g>
    </svg>
  ),
  wB: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-wB">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinecap: 'round', strokeLinejoin: 'round' , filter: 'url(#dropShadow-wB)'}}>
        <g style={{ stroke: WHITE_MAIN }}>
          <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
          <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
          <path d="M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z" />
        </g>
        <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" style={{ stroke: WHITE_ACCENT, strokeLinejoin: 'miter' }} />
      </g>
    </svg>
  ),
  wQ: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-wQ">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinejoin: 'round' , filter: 'url(#dropShadow-wQ)'}}>
        <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z" style={{ stroke: WHITE_MAIN }} />
        <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" style={{ stroke: WHITE_MAIN }} />
        <path d="M 11.5,30 C 15,29 30,29 33.5,30" style={{ stroke: WHITE_ACCENT }} />
        <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" style={{ stroke: WHITE_ACCENT }} />
        <circle cx="6" cy="12" r="2" style={{ fill: WHITE_ACCENT, stroke: WHITE_ACCENT }} />
        <circle cx="14" cy="9" r="2" style={{ fill: WHITE_ACCENT, stroke: WHITE_ACCENT }} />
        <circle cx="22.5" cy="8" r="2" style={{ fill: WHITE_ACCENT, stroke: WHITE_ACCENT }} />
        <circle cx="31" cy="9" r="2" style={{ fill: WHITE_ACCENT, stroke: WHITE_ACCENT }} />
        <circle cx="39" cy="12" r="2" style={{ fill: WHITE_ACCENT, stroke: WHITE_ACCENT }} />
      </g>
    </svg>
  ),
  wK: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-wK">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinecap: 'round', strokeLinejoin: 'round' , filter: 'url(#dropShadow-wK)'}}>
        <path d="M 22.5,11.63 L 22.5,6" style={{ stroke: WHITE_MAIN, strokeLinejoin: 'miter' }} />
        <path d="M 20,8 L 25,8" style={{ stroke: WHITE_MAIN, strokeLinejoin: 'miter' }} />
        <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" style={{ stroke: WHITE_MAIN }} />
        <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" style={{ stroke: WHITE_MAIN }} />
        <path d="M 12.5,30 C 18,27 27,27 32.5,30" style={{ stroke: WHITE_ACCENT }} />
        <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" style={{ stroke: WHITE_ACCENT }} />
        <path d="M 12.5,37 C 18,34 27,34 32.5,37" style={{ stroke: WHITE_ACCENT }} />
      </g>
    </svg>
  ),
  bP: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-bP">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <path
        d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 H 34 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
        style={{
          fill: TRANSPARENT,
          stroke: BLACK_MAIN,
          strokeWidth: STROKE_WIDTH,
          strokeLinecap: 'round',
          strokeLinejoin: 'miter',
          filter: 'url(#dropShadow-bP)',
        }}
      />
    </svg>
  ),
  bR: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-bR">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinecap: 'round', strokeLinejoin: 'round' , filter: 'url(#dropShadow-bR)'}}>
        <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z " style={{ stroke: BLACK_MAIN }} />
        <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z " style={{ stroke: BLACK_MAIN }} />
        <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" style={{ stroke: BLACK_MAIN }} />
        <path d="M 34,14 L 31,17 L 14,17 L 11,14" style={{ stroke: BLACK_MAIN }} />
        <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" style={{ stroke: BLACK_MAIN }} />
        <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" style={{ stroke: BLACK_MAIN }} />
        <path d="M 11,14 L 34,14" style={{ stroke: BLACK_ACCENT }} />
      </g>
    </svg>
  ),
  bN: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-bN">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinecap: 'round', strokeLinejoin: 'round' , filter: 'url(#dropShadow-bN)'}}>
        <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style={{ stroke: BLACK_MAIN }} />
        <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" style={{ stroke: BLACK_MAIN }} />
        <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" style={{ fill: BLACK_ACCENT, stroke: BLACK_ACCENT }} />
        <path d="M 15 15.5 A 0.5 1.5 0 1 1  14,15.5 A 0.5 1.5 0 1 1  15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style={{ fill: BLACK_ACCENT, stroke: BLACK_ACCENT }} />
      </g>
    </svg>
  ),
  bB: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-bB">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinecap: 'round', strokeLinejoin: 'round' , filter: 'url(#dropShadow-bB)'}}>
        <g style={{ stroke: BLACK_MAIN }}>
          <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
          <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 27.5,26 C 33,24.5 33.5,14.5 22.5,10.5 C 11.5,14.5 12,24.5 17.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
          <path d="M 25 8 A 2.5 2.5 0 1 1  20,8 A 2.5 2.5 0 1 1  25 8 z" />
        </g>
        <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" style={{ stroke: BLACK_ACCENT, strokeLinejoin: 'miter' }} />
      </g>
    </svg>
  ),
  bQ: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-bQ">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinejoin: 'round' , filter: 'url(#dropShadow-bQ)'}}>
        <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.9 L 14,25 L 6.5,13.5 L 9,26 z" style={{ stroke: BLACK_MAIN }} />
        <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 9.5,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 35.5,37.5 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" style={{ stroke: BLACK_MAIN }} />
        <path d="M 11.5,30 C 15,29 30,29 33.5,30" style={{ stroke: BLACK_ACCENT }} />
        <path d="M 12,33.5 C 18,32.5 27,32.5 33,33.5" style={{ stroke: BLACK_ACCENT }} />
        <circle cx="6" cy="12" r="2" style={{ fill: BLACK_ACCENT, stroke: BLACK_ACCENT }} />
        <circle cx="14" cy="9" r="2" style={{ fill: BLACK_ACCENT, stroke: BLACK_ACCENT }} />
        <circle cx="22.5" cy="8" r="2" style={{ fill: BLACK_ACCENT, stroke: BLACK_ACCENT }} />
        <circle cx="31" cy="9" r="2" style={{ fill: BLACK_ACCENT, stroke: BLACK_ACCENT }} />
        <circle cx="39" cy="12" r="2" style={{ fill: BLACK_ACCENT, stroke: BLACK_ACCENT }} />
      </g>
    </svg>
  ),
  bK: () => (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 45 45" width="100%" height="100%" style={{ mixBlendMode: 'normal' }}>
      <defs>
        <filter id="dropShadow-bK">
          <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="white" floodOpacity="0.8"/>
        </filter>
      </defs>
      <g style={{ fill: TRANSPARENT, strokeWidth: STROKE_WIDTH, strokeLinecap: 'round', strokeLinejoin: 'round' , filter: 'url(#dropShadow-bK)'}}>
        <path d="M 22.5,11.63 L 22.5,6" style={{ stroke: BLACK_MAIN, strokeLinejoin: 'miter' }} />
        <path d="M 20,8 L 25,8" style={{ stroke: BLACK_MAIN, strokeLinejoin: 'miter' }} />
        <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" style={{ stroke: BLACK_MAIN }} />
        <path d="M 12.5,37 C 18,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 20,16 10.5,13 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37" style={{ stroke: BLACK_MAIN }} />
        <path d="M 12.5,30 C 18,27 27,27 32.5,30" style={{ stroke: BLACK_ACCENT }} />
        <path d="M 12.5,33.5 C 18,30.5 27,30.5 32.5,33.5" style={{ stroke: BLACK_ACCENT }} />
        <path d="M 12.5,37 C 18,34 27,34 32.5,37" style={{ stroke: BLACK_ACCENT }} />
      </g>
    </svg>
  ),
};
