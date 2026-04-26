import ownersReducer, {
  fetchOwners,
  fetchOwner,
  createOwner,
  updateOwner,
  clearSelected,
  clearError,
} from '../store/slices/ownersSlice';

const initialState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

describe('ownersSlice — reducer', () => {
  it('returns the initial state', () => {
    expect(ownersReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ── fetchOwners ────────────────────────────────────────────────────────────

  it('sets isLoading true on fetchOwners.pending', () => {
    const state = ownersReducer(initialState, fetchOwners.pending(''));
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('populates list on fetchOwners.fulfilled', () => {
    const owners = [
      { id: 1, firstName: 'Jane', lastName: 'Doe', email: 'j@d.com' },
      { id: 2, firstName: 'John', lastName: 'Smith', email: 'js@s.com' },
    ];
    const state = ownersReducer(initialState, fetchOwners.fulfilled(owners, ''));
    expect(state.list).toEqual(owners);
    expect(state.isLoading).toBe(false);
  });

  it('handles empty list on fetchOwners.fulfilled', () => {
    const state = ownersReducer(initialState, fetchOwners.fulfilled([], ''));
    expect(state.list).toHaveLength(0);
    expect(state.isLoading).toBe(false);
  });

  it('sets error on fetchOwners.rejected', () => {
    const state = ownersReducer(
      initialState,
      fetchOwners.rejected(null, '', undefined, 'Network error'),
    );
    expect(state.error).toBe('Network error');
    expect(state.isLoading).toBe(false);
    expect(state.list).toHaveLength(0);
  });

  // ── fetchOwner (single) ────────────────────────────────────────────────────

  it('sets selected on fetchOwner.fulfilled', () => {
    const owner = { id: 1, firstName: 'Jane', lastName: 'Doe' };
    const state = ownersReducer(initialState, fetchOwner.fulfilled(owner, ''));
    expect(state.selected).toEqual(owner);
  });

  it('sets error on fetchOwner.rejected (not found)', () => {
    const state = ownersReducer(
      initialState,
      fetchOwner.rejected(null, '', undefined, 'Owner not found'),
    );
    expect(state.error).toBe('Owner not found');
  });

  // ── createOwner ────────────────────────────────────────────────────────────

  it('appends new owner to list on createOwner.fulfilled', () => {
    const existing = { ...initialState, list: [{ id: 1, firstName: 'Alice' }] };
    const newOwner = { id: 2, firstName: 'Bob' };
    const state = ownersReducer(existing, createOwner.fulfilled(newOwner, ''));
    expect(state.list).toHaveLength(2);
    expect(state.list[1]).toEqual(newOwner);
  });

  it('sets error on createOwner.rejected', () => {
    const state = ownersReducer(
      initialState,
      createOwner.rejected(null, '', undefined, 'Validation failed'),
    );
    expect(state.error).toBe('Validation failed');
  });

  // ── updateOwner ────────────────────────────────────────────────────────────

  it('updates owner in list and selected on updateOwner.fulfilled', () => {
    const existing = {
      ...initialState,
      list: [{ id: 1, firstName: 'Old' }, { id: 2, firstName: 'Other' }],
      selected: { id: 1, firstName: 'Old' },
    };
    const updated = { id: 1, firstName: 'New' };
    const state = ownersReducer(existing, updateOwner.fulfilled(updated, ''));
    expect(state.list[0].firstName).toBe('New');
    expect(state.list[1].firstName).toBe('Other');
    expect(state.selected.firstName).toBe('New');
    expect(state.isLoading).toBe(false);
  });

  it('sets error on updateOwner.rejected', () => {
    const state = ownersReducer(
      initialState,
      updateOwner.rejected(null, '', undefined, 'Unauthorised'),
    );
    expect(state.error).toBe('Unauthorised');
  });

  // ── Sync actions ──────────────────────────────────────────────────────────

  it('clearSelected sets selected to null', () => {
    const withSelected = { ...initialState, selected: { id: 1 } };
    const state = ownersReducer(withSelected, clearSelected());
    expect(state.selected).toBeNull();
  });

  it('clearError sets error to null', () => {
    const withError = { ...initialState, error: 'Something went wrong' };
    const state = ownersReducer(withError, clearError());
    expect(state.error).toBeNull();
  });
});
