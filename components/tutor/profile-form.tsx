"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
    tutorId: number;
    initialData: {
        bio: string | null;
        specialization: string | null;
        experienceYears: number | null;
        hourlyRate: string | null;
    };
}

export function ProfileForm({ tutorId, initialData }: ProfileFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: initialData.bio || "",
        specialization: initialData.specialization || "",
        experienceYears: initialData.experienceYears?.toString() || "",
        hourlyRate: initialData.hourlyRate || "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`/api/tutors/${tutorId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update profile");
            }

            toast({
                title: "Success",
                description: "Profile updated successfully",
            });
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Basic Information</CardTitle>
                {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                            id="specialization"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="e.g. Mathematics, Physics"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="hourlyRate">Hourly Rate (IDR)</Label>
                        <Input
                            id="hourlyRate"
                            name="hourlyRate"
                            type="number"
                            value={formData.hourlyRate}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="experienceYears">Experience (Years)</Label>
                        <Input
                            id="experienceYears"
                            name="experienceYears"
                            type="number"
                            value={formData.experienceYears}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={!isEditing}
                            placeholder="Tell us about yourself..."
                            className="min-h-[100px]"
                        />
                    </div>
                    {isEditing && (
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        bio: initialData.bio || "",
                                        specialization: initialData.specialization || "",
                                        experienceYears: initialData.experienceYears?.toString() || "",
                                        hourlyRate: initialData.hourlyRate || "",
                                    });
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
