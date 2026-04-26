import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  register,
  logout,
  setCredentials,
  clearError,
} from '../store/slices/authSlice';

// Mock the auth service 
vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
  },
}));

import authService from '../services/authService';

const makeStore = () =>
  configureStore({ reducer: { auth: authReducer } });

const baseState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

// ── Reducer unit tests ────────────────────────────────────────────────────────

describe('authSlice — reducer', () => {
  it('returns the initial state', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets isLoading true on login.pending', () => {
    const state = authReducer(baseState, login.pending('', {}));
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores token and user on login.fulfilled', () => {
    const payload = {
      token: 'tok',
      refreshToken: 'ref',
      email: 'a@b.com',
      fullName: 'Alice',
      role: 'Admin',
    };
    const state = authReducer(baseState, login.fulfilled(payload, ''));
    expect(state.token).toBe('tok');
    expect(state.user).toEqual({ email: 'a@b.com', fullName: 'Alice', role: 'Admin' });
    expect(state.isLoading).toBe(false);
  });

  it('sets error on login.rejected', () => {
    const state = authReducer(
      baseState,
      login.rejected(null, '', undefined, 'Bad credentials'),
    );
    expect(state.error).toBe('Bad credentials');
    expect(state.isLoading).toBe(false);
    expect(state.token).toBeNull();
  });

  it('clears token and user on logout', () => {
    const loggedIn = { ...baseState, token: 'tok', user: { email: 'a@b.com', role: 'Admin' } };
    const state = authReducer(loggedIn, logout());
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('clearError sets error to null', () => {
    const withError = { ...baseState, error: 'Some error' };
    const state = authReducer(withError, clearError());
    expect(state.error).toBeNull();
  });

  it('setCredentials updates token and user without a network call', () => {
    const payload = {
      token: 'new-tok',
      refreshToken: 'new-ref',
      email: 'b@c.com',
      fullName: 'Bob',
      role: 'Veterinarian',
    };
    const state = authReducer(baseState, setCredentials(payload));
    expect(state.token).toBe('new-tok');
    expect(state.user.role).toBe('Veterinarian');
  });
});

// ── Thunk integration tests (mocked service) ─────────────────────────────────

describe('authSlice — thunks (mocked authService)', () => {
  let store;

  beforeEach(() => {
    store = makeStore();
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('login — success: stores token and user in state', async () => {
    authService.login.mockResolvedValue({
      token: 'tok123',
      refreshToken: 'ref123',
      email: 'a@b.com',
      fullName: 'Alice',
      role: 'Admin',
    });

    await store.dispatch(login({ email: 'a@b.com', password: 'pass1234' }));

    const state = store.getState().auth;
    expect(state.token).toBe('tok123');
    expect(state.user.role).toBe('Admin');
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('login — failure: sets error, leaves token null', async () => {
    authService.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    await store.dispatch(login({ email: 'a@b.com', password: 'wrong' }));

    const state = store.getState().auth;
    expect(state.token).toBeNull();
    expect(state.error).toBe('Invalid credentials');
  });

  it('register — success: isLoading false, no token set', async () => {
    authService.register.mockResolvedValue({});

    await store.dispatch(
      register({ fullName: 'Bob', email: 'b@c.com', password: 'pass1234' }),
    );

    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.token).toBeNull();
    expect(state.error).toBeNull();
  });

  it('register — failure: sets error message', async () => {
    authService.register.mockRejectedValue({
      response: { data: { message: 'Email already exists' } },
    });

    await store.dispatch(
      register({ fullName: 'Bob', email: 'b@c.com', password: 'pass1234' }),
    );

    expect(store.getState().auth.error).toBe('Email already exists');
  });
});
