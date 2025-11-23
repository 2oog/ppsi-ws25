'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function TutorSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('subject') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) {
            params.set('subject', query);
        }
        router.push(`/dashboard/student/search?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
                type="text"
                placeholder="Search by subject..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
            </Button>
        </form>
    );
}
