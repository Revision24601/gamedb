// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '',
}));

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/gamedb_test';

// Global setup
global.beforeAll(async () => {
  // Add global setup here
});

// Global teardown
global.afterAll(async () => {
  // Add global teardown here
});

// Increase timeout for tests
jest.setTimeout(30000); 