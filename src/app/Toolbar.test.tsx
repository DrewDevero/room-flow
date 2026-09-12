import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEmptyProject } from '../core/model/factory';
import { useProjectStore } from '../state/projectStore';
import { useUiStore } from '../state/uiStore';
import { Toolbar } from './Toolbar';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  useProjectStore.setState({ project: createEmptyProject() });
  useProjectStore.temporal.getState().clear();
  useUiStore.setState({ viewMode: '2d', exportImageRequestId: 0, exportImageViewMode: null });
});

describe('Toolbar', () => {
  it('offers project and reference image import actions', () => {
    render(<Toolbar />);

    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    expect(screen.getByRole('menuitem', { name: 'Project File (.json)' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Reference Image' })).toBeInTheDocument();
  });

  it('requests targeted 2D and 3D image exports from the export dropdown', () => {
    render(<Toolbar />);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Save 3D Image' }));
    expect(useUiStore.getState().viewMode).toBe('3d');
    expect(useUiStore.getState().exportImageViewMode).toBe('3d');
    expect(useUiStore.getState().exportImageRequestId).toBe(1);

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Save 2D Image' }));
    expect(useUiStore.getState().viewMode).toBe('2d');
    expect(useUiStore.getState().exportImageViewMode).toBe('2d');
    expect(useUiStore.getState().exportImageRequestId).toBe(2);
  });
});