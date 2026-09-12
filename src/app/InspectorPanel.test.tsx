import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { createEmptyProject } from '../core/model/factory';
import { useProjectStore } from '../state/projectStore';
import { useUiStore } from '../state/uiStore';
import { InspectorPanel } from './InspectorPanel';

afterEach(() => {
  cleanup();
  useProjectStore.setState({ project: createEmptyProject() });
  useProjectStore.temporal.getState().clear();
  useUiStore.setState({ selection: null });
});

describe('InspectorPanel', () => {
  function renderFurnitureInspector() {
    const project = createEmptyProject('Inspector test');
    project.unitSystem = 'metric';
    project.floors[0].furniture.push({
      id: 'furniture-1',
      catalogId: 'basic-rect',
      name: 'Rectangle',
      shape: 'rect',
      widthMm: 1000,
      depthMm: 500,
      heightMm: 750,
      position: { x: 0, y: 0 },
      rotationDeg: 0,
      colorHex: '#9ca3af',
    });

    useProjectStore.setState({ project });
    useProjectStore.temporal.getState().clear();
    useUiStore.setState({ selection: { type: 'furniture', id: 'furniture-1' } });

    render(<InspectorPanel />);
  }

  it('updates length input submissions after undo and redo', () => {
    renderFurnitureInspector();

    expect(screen.getByLabelText('Width')).toHaveValue('1.00m');

    act(() => {
      useProjectStore.getState().updateFurniture('furniture-1', { widthMm: 1500 });
    });
    expect(screen.getByLabelText('Width')).toHaveValue('1.50m');

    act(() => {
      useProjectStore.temporal.getState().undo();
    });
    expect(screen.getByLabelText('Width')).toHaveValue('1.00m');

    act(() => {
      useProjectStore.temporal.getState().redo();
    });
    expect(screen.getByLabelText('Width')).toHaveValue('1.50m');
  });

  it('commits a typed length on blur', () => {
    renderFurnitureInspector();

    const widthInput = screen.getByLabelText('Width');
    fireEvent.change(widthInput, { target: { value: '125cm' } });
    fireEvent.blur(widthInput);

    expect(useProjectStore.getState().project.floors[0].furniture[0].widthMm).toBe(1250);
    expect(screen.getByLabelText('Width')).toHaveValue('1.25m');
  });

  it('commits a valid length when focus leaves the field', () => {
    renderFurnitureInspector();

    const widthInput = screen.getByLabelText('Width');
    const depthInput = screen.getByLabelText('Depth');
    fireEvent.focus(widthInput);
    fireEvent.change(widthInput, { target: { value: '1.4m' } });
    fireEvent.blur(widthInput, { relatedTarget: depthInput });
    fireEvent.focus(depthInput);

    expect(useProjectStore.getState().project.floors[0].furniture[0].widthMm).toBe(1400);
    expect(screen.getByLabelText('Width')).toHaveValue('1.40m');
  });

  it('reverts blank or non-dimension text on blur without changing the dimension', () => {
    renderFurnitureInspector();

    const widthInput = screen.getByLabelText('Width');
    fireEvent.change(widthInput, { target: { value: '' } });
    fireEvent.blur(widthInput);

    expect(useProjectStore.getState().project.floors[0].furniture[0].widthMm).toBe(1000);
    expect(screen.getByLabelText('Width')).toHaveValue('1.00m');

    const depthInput = screen.getByLabelText('Depth');
    fireEvent.change(depthInput, { target: { value: 'wide enough' } });
    fireEvent.blur(depthInput);

    expect(useProjectStore.getState().project.floors[0].furniture[0].depthMm).toBe(500);
    expect(screen.getByLabelText('Depth')).toHaveValue('50.0cm');
  });

  it('commits a pasted length with Enter', () => {
    renderFurnitureInspector();

    const depthInput = screen.getByLabelText('Depth');
    fireEvent.change(depthInput, { target: { value: '92cm' } });
    fireEvent.keyDown(depthInput, { key: 'Enter' });

    expect(useProjectStore.getState().project.floors[0].furniture[0].depthMm).toBe(920);
    expect(screen.getByLabelText('Depth')).toHaveValue('92.0cm');
  });
});