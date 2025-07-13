import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useChessGame } from '../../src/hooks/useChessGame';

describe('useChessGame', () => {
  it('should initialize with starting position', () => {
    const { result } = renderHook(() => useChessGame());
    
    expect(result.current.chessPosition).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(result.current.moveHistory).toEqual([]);
    expect(result.current.currentMoveIndex).toBe(-1);
    expect(result.current.isAtFinalPosition).toBe(true);
  });

  it('should make a valid move', () => {
    const { result } = renderHook(() => useChessGame());
    
    act(() => {
      const success = result.current.makeMove('e2', 'e4');
      expect(success).toBe(true);
    });
    
    expect(result.current.moveHistory).toEqual(['e4']);
    expect(result.current.currentMoveIndex).toBe(0);
    expect(result.current.chessPosition).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
  });

  it('should reject invalid moves', () => {
    const { result } = renderHook(() => useChessGame());
    
    act(() => {
      const success = result.current.makeMove('e2', 'e5');
      expect(success).toBe(false);
    });
    
    expect(result.current.moveHistory).toEqual([]);
    expect(result.current.currentMoveIndex).toBe(-1);
  });

  it('should navigate through move history', () => {
    const { result } = renderHook(() => useChessGame());
    
    // Make some moves
    act(() => {
      result.current.makeMove('e2', 'e4');
      result.current.makeMove('e7', 'e5');
    });
    
    expect(result.current.currentMoveIndex).toBe(1);
    
    // Go back to start
    act(() => {
      result.current.goToStart();
    });
    
    expect(result.current.currentMoveIndex).toBe(-1);
    expect(result.current.chessPosition).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    
    // Go forward
    act(() => {
      result.current.goForward();
    });
    
    expect(result.current.currentMoveIndex).toBe(0);
  });
});
