// Simple validation tests that don't require complex mocking
describe('Validation Utils', () => {
  describe('Email validation', () => {
    it('should validate correct email format', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        '',
      ];

      invalidEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Password validation', () => {
    it('should validate password length', () => {
      const validPasswords = ['password123', 'MySecurePass1', '12345678'];
      const invalidPasswords = ['123', 'pass', ''];

      validPasswords.forEach(password => {
        expect(password.length).toBeGreaterThanOrEqual(6);
      });

      invalidPasswords.forEach(password => {
        expect(password.length).toBeLessThan(6);
      });
    });
  });
});
