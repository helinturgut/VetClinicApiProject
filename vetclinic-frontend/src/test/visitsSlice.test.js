import visitsReducer, {
  fetchVisits,
  createVisit,
  updateVisit,
  deleteVisit,
  fetchDiagnoses,
  addDiagnosis,
  fetchTreatments,
  addTreatment,
  clearSelected,
  clearError,
} from '../store/slices/visitsSlice';

const initialState = {
  list: [],
  selected: null,
  diagnoses: [],
  treatments: [],
  isLoading: false,
  error: null,
};

describe('visitsSlice — reducer', () => {
  it('returns the initial state', () => {
    expect(visitsReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // ── fetchVisits ───────────────────────────────────────────────────────────

  it('sets isLoading true on fetchVisits.pending', () => {
    const state = visitsReducer(initialState, fetchVisits.pending(''));
    expect(state.isLoading).toBe(true);
  });

  it('populates list on fetchVisits.fulfilled', () => {
    const visits = [
      { id: 1, reason: 'Checkup', status: 'Scheduled' },
      { id: 2, reason: 'Vaccination', status: 'Completed' },
    ];
    const state = visitsReducer(initialState, fetchVisits.fulfilled(visits, ''));
    expect(state.list).toEqual(visits);
    expect(state.isLoading).toBe(false);
  });

  it('handles empty visits list', () => {
    const state = visitsReducer(initialState, fetchVisits.fulfilled([], ''));
    expect(state.list).toHaveLength(0);
  });

  it('sets error on fetchVisits.rejected (e.g. unauthorised)', () => {
    const state = visitsReducer(
      initialState,
      fetchVisits.rejected(null, '', undefined, 'Unauthorised'),
    );
    expect(state.error).toBe('Unauthorised');
    expect(state.isLoading).toBe(false);
  });

  // ── createVisit / updateVisit ─────────────────────────────────────────────

  it('appends visit to list on createVisit.fulfilled', () => {
    const existing = { ...initialState, list: [{ id: 1 }] };
    const newVisit = { id: 2, reason: 'Dental', status: 'Scheduled' };
    const state = visitsReducer(existing, createVisit.fulfilled(newVisit, ''));
    expect(state.list).toHaveLength(2);
    expect(state.list[1]).toEqual(newVisit);
  });

  it('updates selected and list entry on updateVisit.fulfilled', () => {
    const existing = {
      ...initialState,
      list: [{ id: 1, status: 'Scheduled' }],
      selected: { id: 1, status: 'Scheduled' },
    };
    const updated = { id: 1, status: 'Completed' };
    const state = visitsReducer(existing, updateVisit.fulfilled(updated, ''));
    expect(state.list[0].status).toBe('Completed');
    expect(state.selected.status).toBe('Completed');
  });

  // ── deleteVisit ───────────────────────────────────────────────────────────

  it('removes visit from list on deleteVisit.fulfilled', () => {
    const existing = { ...initialState, list: [{ id: 1 }, { id: 2 }] };
    const state = visitsReducer(existing, deleteVisit.fulfilled(1, ''));
    expect(state.list).toHaveLength(1);
    expect(state.list[0].id).toBe(2);
    expect(state.selected).toBeNull();
  });

  it('sets error on deleteVisit.rejected', () => {
    const state = visitsReducer(
      initialState,
      deleteVisit.rejected(null, '', undefined, 'Forbidden'),
    );
    expect(state.error).toBe('Forbidden');
  });

  // ── Diagnoses ─────────────────────────────────────────────────────────────

  it('populates diagnoses on fetchDiagnoses.fulfilled', () => {
    const diags = [{ id: 10, description: 'Infection' }];
    const state = visitsReducer(initialState, fetchDiagnoses.fulfilled(diags, ''));
    expect(state.diagnoses).toEqual(diags);
  });

  it('handles empty diagnoses list', () => {
    const state = visitsReducer(initialState, fetchDiagnoses.fulfilled([], ''));
    expect(state.diagnoses).toHaveLength(0);
  });

  it('appends diagnosis on addDiagnosis.fulfilled', () => {
    const existing = { ...initialState, diagnoses: [{ id: 10, description: 'Flu' }] };
    const newDiag = { id: 11, description: 'Infection' };
    const state = visitsReducer(existing, addDiagnosis.fulfilled(newDiag, ''));
    expect(state.diagnoses).toHaveLength(2);
    expect(state.diagnoses[1]).toEqual(newDiag);
  });

  it('sets error on addDiagnosis.rejected', () => {
    const state = visitsReducer(
      initialState,
      addDiagnosis.rejected(null, '', undefined, 'Server error'),
    );
    expect(state.error).toBe('Server error');
  });

  // ── Treatments ────────────────────────────────────────────────────────────

  it('populates treatments on fetchTreatments.fulfilled', () => {
    const treatments = [{ id: 20, name: 'Antibiotics' }];
    const state = visitsReducer(initialState, fetchTreatments.fulfilled(treatments, ''));
    expect(state.treatments).toEqual(treatments);
  });

  it('appends treatment on addTreatment.fulfilled', () => {
    const existing = { ...initialState, treatments: [{ id: 20, name: 'Antibiotics' }] };
    const newTreatment = { id: 21, name: 'Painkillers' };
    const state = visitsReducer(existing, addTreatment.fulfilled(newTreatment, ''));
    expect(state.treatments).toHaveLength(2);
    expect(state.treatments[1]).toEqual(newTreatment);
  });

  // ── clearSelected ─────────────────────────────────────────────────────────

  it('clearSelected resets selected, diagnoses, and treatments', () => {
    const loaded = {
      ...initialState,
      selected: { id: 1, reason: 'Checkup' },
      diagnoses: [{ id: 10 }],
      treatments: [{ id: 20 }],
    };
    const state = visitsReducer(loaded, clearSelected());
    expect(state.selected).toBeNull();
    expect(state.diagnoses).toHaveLength(0);
    expect(state.treatments).toHaveLength(0);
  });

  it('clearError sets error to null', () => {
    const withError = { ...initialState, error: 'Some error' };
    const state = visitsReducer(withError, clearError());
    expect(state.error).toBeNull();
  });
});
