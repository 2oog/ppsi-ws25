'use server';

import { db, users } from '@/lib/db'; // Adjust path if necessary
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function toggleUserBan(userId: number, currentStatus: boolean | null) {
    try {
        const newStatus = !currentStatus;

        await db
            .update(users)
            .set({ banned: newStatus })
            .where(eq(users.id, userId));

        revalidatePath('/dashboard/admin/users');
        return { success: true, message: `User ${newStatus ? 'banned' : 'unbanned'} successfully.` };
    } catch (error) {
        console.error('Failed to toggle user ban:', error);
        return { success: false, message: 'Failed to update user status.' };
    }
}
