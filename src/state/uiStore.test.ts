import { afterEach, describe, expect, it } from 'vitest';
import { useUiStore } from './uiStore';

afterEach(() => {
  useUiStore.setState({
    viewMode: '2d',
    exportImageRequestId: 0,
    exportImageViewMode: null,
  });
});

describe('useUiStore image exports', () => {
  it('clears a matching export request after it is handled', () => {
    useUiStore.getState().requestExportImage('3d');

    const requestId = useUiStore.getState().exportImageRequestId;
    expect(useUiStore.getState().viewMode).toBe('3d');
    expect(useUiStore.getState().exportImageViewMode).toBe('3d');

    useUiStore.getState().consumeExportImageRequest(requestId);

    expect(useUiStore.getState().exportImageRequestId).toBe(requestId);
    expect(useUiStore.getState().exportImageViewMode).toBeNull();
  });

  it('does not clear a newer export request when an old handler finishes late', () => {
    useUiStore.getState().requestExportImage('3d');
    const oldRequestId = useUiStore.getState().exportImageRequestId;

    useUiStore.getState().requestExportImage('2d');
    const newRequestId = useUiStore.getState().exportImageRequestId;
    useUiStore.getState().consumeExportImageRequest(oldRequestId);

    expect(useUiStore.getState().exportImageRequestId).toBe(newRequestId);
    expect(useUiStore.getState().exportImageViewMode).toBe('2d');
  });
});