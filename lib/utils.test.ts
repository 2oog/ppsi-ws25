import { cn } from './utils';
import { describe, it, expect } from 'vitest';

describe("Unit Test: Utility Function 'cn'", () => {
    it('should merge simple classes correctly', () => {
        const result = cn('bg-red-500', 'text-white');
        expect(result).toBe('bg-red-500 text-white');
    });

    it('should handle conditional classes', () => {
        const isError = true;
        const result = cn('border', isError && 'border-red-500');
        expect(result).toBe('border border-red-500');
    });

    it('should resolve tailwind class conflicts (using tailwind-merge)', () => {
        // px-2 should be overridden by px-4
        const result = cn('px-2 py-1', 'px-4');
        expect(result).toBe('py-1 px-4');
    });
});
