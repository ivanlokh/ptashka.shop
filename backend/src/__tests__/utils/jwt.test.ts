import { generateToken, generateRefreshToken } from '../../utils/jwt';

describe('JWT Utils', () => {
  const mockPayload = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'user',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken(mockPayload);
      const token2 = generateToken({ ...mockPayload, id: 'different-id' });
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const refreshToken = generateRefreshToken(mockPayload);
      
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateRefreshToken(mockPayload);
      const token2 = generateRefreshToken({ ...mockPayload, email: 'different@example.com' });
      
      expect(token1).not.toBe(token2);
    });
  });
});
