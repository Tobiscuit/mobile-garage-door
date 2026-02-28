import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provisionUserFromSession } from './provision-user-from-session';

// 1. Mock the Payload DB
// Instead of connecting to Postgres, we just create spy blocks
const mockCreate = vi.fn();
const mockUpdate = vi.fn().mockResolvedValue({});
const mockFind = vi.fn();

vi.mock('payload', () => ({
  getPayload: vi.fn(() => Promise.resolve({
    create: mockCreate,
    update: mockUpdate,
    find: mockFind,
  })),
}));

// Mock the config to avoid loading real schemas
vi.mock('@/payload.config', () => ({
  default: {},
}));

describe('provisionUserFromSession.ts', () => {
  beforeEach(() => {
    // Clear our spies before every test!
    vi.clearAllMocks();
  });

  it('should treat a missing session as a customer role but not profile complete', async () => {
    const result = await provisionUserFromSession(undefined);
    expect(result).toEqual({ role: 'customer', profileComplete: true });
  });

  it('should auto-update the user name from Google SSO if the name is missing in Payload', async () => {
    // Scenario: We found exactly 1 user in Payload, but their name is missing.
    mockFind.mockResolvedValueOnce({
      totalDocs: 1,
      docs: [{ id: 1, email: 't-rex@gmail.com', role: 'customer', name: null }],
    });

    // We also need to mock the second concurrent query searching for pending invites!
    mockFind.mockResolvedValueOnce({
      totalDocs: 0,
      docs: [],
    });

    // The session from Better Auth / Google SSO HAS the name.
    const googleSession = {
      email: 't-rex@gmail.com',
      role: 'customer',
      name: 'Tyrannosaurus Rex',
    };

    const result = await provisionUserFromSession(googleSession);

    // Verify 1: The update function was actually called with the Google name!
    expect(mockUpdate).toHaveBeenCalledWith({
      collection: 'users',
      id: 1,
      data: { name: 'Tyrannosaurus Rex' },
    });

    // Verify 2: It returned the correct result
    expect(result).toEqual({ role: 'customer', profileComplete: true });
  });

  it('should upgrade a customer to the invited role smoothly if they accept an invite', async () => {
    // 1. Mock DB returns existing customer
    mockFind.mockResolvedValueOnce({
      totalDocs: 1,
      docs: [{ id: 42, email: 'new-tech@example.com', role: 'customer', name: 'Bob' }],
    });

    // 2. Mock DB returns a pending invite for technician!
    mockFind.mockResolvedValueOnce({
      totalDocs: 1,
      docs: [
        { 
          id: 99, 
          email: 'new-tech@example.com', 
          role: 'technician',
          firstName: 'Robert',
          lastName: 'Smith',
        }
      ],
    });

    const googleSession = {
      email: 'new-tech@example.com',
      role: 'customer',
      name: 'Bob',
    };

    const result = await provisionUserFromSession(googleSession);

    // Verify the update function was called to UPGRADE the user to technician
    expect(mockUpdate).toHaveBeenCalledWith({
      collection: 'users',
      id: 42,
      data: expect.objectContaining({ role: 'technician' }),
    });

    // Verify it returns the new upgraded role
    expect(result).toEqual({ role: 'technician', profileComplete: true });
  });
});
