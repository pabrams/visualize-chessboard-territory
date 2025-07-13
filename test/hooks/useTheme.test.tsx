import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTheme } from '../../src/hooks/useTheme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  key: vi.fn(),
  length: 0,
};

vi.stubGlobal('localStorage', localStorageMock);

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with dark theme by default', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('dark');
    expect(result.current.currentThemeColors.pageBackgroundColor).toBe('#0a0a0a');
  });

  it('should initialize with saved theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('light');
    expect(result.current.currentThemeColors.pageBackgroundColor).toBe('#f8f9fa');
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('dark');
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
  });

  it('should update theme colors', () => {
    const { result } = renderHook(() => useTheme());
    
    const newColors = { pageBackgroundColor: '#123456' };
    
    act(() => {
      result.current.updateThemeColors(newColors);
    });
    
    expect(result.current.currentThemeColors.pageBackgroundColor).toBe('#123456');
  });
});
