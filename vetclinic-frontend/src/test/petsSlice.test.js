import petsReducer, {
  fetchPets,
  fetchPet,
  createPet,
  updatePet,
  deletePet,
  fetchPetHistory,
  clearSelected,
  clearError,
} from '../store/slices/petsSlice';

const initialState = {
  list: [],
  selected: null,
  history: [],
  isLoading: false,
  error: null,
};

describe('petsSlice — reducer', () => {
  it('returns the initial state', () => {
    expect(petsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ── fetchPets ──────────────────────────────────────────────────────────────

  it('sets isLoading true on fetchPets.pending', () => {
    const state = petsReducer(initialState, fetchPets.pending(''));
    expect(state.isLoading).toBe(true);
  });

  it('populates list on fetchPets.fulfilled', () => {
    const pets = [
      { id: 1, name: 'Buddy', species: 'Dog' },
      { id: 2, name: 'Whiskers', species: 'Cat' },
    ];
    const state = petsReducer(initialState, fetchPets.fulfilled(pets, ''));
    expect(state.list).toEqual(pets);
    expect(state.isLoading).toBe(false);
  });

  it('handles empty pets list', () => {
    const state = petsReducer(initialState, fetchPets.fulfilled([], ''));
    expect(state.list).toHaveLength(0);
  });

  it('sets error on fetchPets.rejected', () => {
    const state = petsReducer(
      initialState,
      fetchPets.rejected(null, '', undefined, 'Unauthorised'),
    );
    expect(state.error).toBe('Unauthorised');
    expect(state.isLoading).toBe(false);
  });

  // ── createPet ─────────────────────────────────────────────────────────────

  it('appends new pet to list on createPet.fulfilled', () => {
    const existing = { ...initialState, list: [{ id: 1, name: 'Buddy' }] };
    const newPet = { id: 2, name: 'Max', species: 'Dog' };
    const state = petsReducer(existing, createPet.fulfilled(newPet, ''));
    expect(state.list).toHaveLength(2);
    expect(state.list[1]).toEqual(newPet);
  });

  it('sets error on createPet.rejected', () => {
    const state = petsReducer(
      initialState,
      createPet.rejected(null, '', undefined, 'Validation failed'),
    );
    expect(state.error).toBe('Validation failed');
  });

  // ── updatePet ─────────────────────────────────────────────────────────────

  it('updates pet in list and selected on updatePet.fulfilled', () => {
    const existing = {
      ...initialState,
      list: [{ id: 1, name: 'Old Name' }, { id: 2, name: 'Other' }],
      selected: { id: 1, name: 'Old Name' },
    };
    const updated = { id: 1, name: 'New Name', species: 'Dog' };
    const state = petsReducer(existing, updatePet.fulfilled(updated, ''));
    expect(state.list[0].name).toBe('New Name');
    expect(state.list[1].name).toBe('Other');
    expect(state.selected.name).toBe('New Name');
  });

  // ── deletePet ─────────────────────────────────────────────────────────────

  it('removes pet from list and clears selected on deletePet.fulfilled', () => {
    const existing = {
      ...initialState,
      list: [{ id: 1 }, { id: 2 }],
      selected: { id: 1 },
    };
    const state = petsReducer(existing, deletePet.fulfilled(1, ''));
    expect(state.list).toHaveLength(1);
    expect(state.list[0].id).toBe(2);
    expect(state.selected).toBeNull();
  });

  it('sets error on deletePet.rejected (e.g. insufficient permissions)', () => {
    const state = petsReducer(
      initialState,
      deletePet.rejected(null, '', undefined, 'Forbidden'),
    );
    expect(state.error).toBe('Forbidden');
  });

  // ── fetchPetHistory ───────────────────────────────────────────────────────

  it('populates history on fetchPetHistory.fulfilled', () => {
    const visits = [
      { id: 10, visitDate: '2024-01-01', status: 'Completed' },
      { id: 11, visitDate: '2024-03-15', status: 'Scheduled' },
    ];
    const state = petsReducer(initialState, fetchPetHistory.fulfilled(visits, ''));
    expect(state.history).toEqual(visits);
  });

  it('handles empty visit history', () => {
    const state = petsReducer(initialState, fetchPetHistory.fulfilled([], ''));
    expect(state.history).toHaveLength(0);
  });

  // ── Sync actions ──────────────────────────────────────────────────────────

  it('clearSelected resets selected and history to empty', () => {
    const loaded = {
      ...initialState,
      selected: { id: 1, name: 'Buddy' },
      history: [{ id: 10 }],
    };
    const state = petsReducer(loaded, clearSelected());
    expect(state.selected).toBeNull();
    expect(state.history).toHaveLength(0);
  });

  it('clearError sets error to null', () => {
    const withError = { ...initialState, error: 'Something failed' };
    const state = petsReducer(withError, clearError());
    expect(state.error).toBeNull();
  });
});
