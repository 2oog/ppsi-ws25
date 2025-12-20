import { describe, it, expect } from 'vitest';
import { registerSchema, formatPhoneNumber } from './route';

describe('White Box Test: Register Route Logic', () => {
    describe('formatPhoneNumber()', () => {
        it('should remove leading +', () => {
            expect(formatPhoneNumber('+628123')).toBe('628123');
        });

        it('should convert leading 0 to 62', () => {
            expect(formatPhoneNumber('08123')).toBe('628123');
        });

        it('should trim whitespace', () => {
            expect(formatPhoneNumber('  08123  ')).toBe('628123');
        });

        it('should keep other numbers as is', () => {
            expect(formatPhoneNumber('628123')).toBe('628123');
        });
    });

    describe('registerSchema', () => {
        it('should reject invalid email', () => {
            const result = registerSchema.safeParse({
                email: 'invalid-email',
                password: 'password123',
                fullname: 'Test User',
                role: 'student',
                phone: '08123'
            });
            expect(result.success).toBe(false);
        });

        it('should reject short password', () => {
            const result = registerSchema.safeParse({
                email: 'test@example.com',
                password: 'abc',
                fullname: 'Test User',
                role: 'student',
                phone: '08123'
            });
            expect(result.success).toBe(false);
        });

        it('should accept valid data', () => {
            const result = registerSchema.safeParse({
                email: 'test@example.com',
                password: 'password123',
                fullname: 'Test User',
                role: 'student',
                phone: '08123'
            });
            expect(result.success).toBe(true);
        });
    });
});
