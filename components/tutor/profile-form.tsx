"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

interface ProfileFormProps {
    tutorId: number;
    userId: number;
    initialData: {
        bio: string | null;
        specialization: string | null;
        experienceYears: number | null;
        hourlyRate: string | null;
        profilePicture: string | null;
        jadwalKetersediaan: Record<string, string[]> | null;
    };
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function ProfileForm({ tutorId, userId, initialData }: ProfileFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: initialData.bio || "",
        specialization: initialData.specialization || "",
        experienceYears: initialData.experienceYears?.toString() || "",
        hourlyRate: initialData.hourlyRate || "",
        profilePicture: initialData.profilePicture || "",
        jadwalKetersediaan: initialData.jadwalKetersediaan || {} as Record<string, string[]>,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("files", file);

        try {
            // 1. Upload to R2
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            const { paths } = await uploadRes.json();
            const imageUrl = paths[0];

            // 2. Update User Profile Picture
            const updateRes = await fetch(`/api/users/${userId}/profile-picture`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profilePicture: imageUrl }),
            });

            if (!updateRes.ok) throw new Error("Failed to update profile picture");

            setFormData((prev) => ({ ...prev, profilePicture: imageUrl }));
            toast({ title: "Success", description: "Profile picture updated" });
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload image",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAvailabilityChange = (day: string, index: number, value: string) => {
        const newAvailability = { ...formData.jadwalKetersediaan };
        if (!newAvailability[day]) newAvailability[day] = [];
        newAvailability[day][index] = value;
        setFormData((prev) => ({ ...prev, jadwalKetersediaan: newAvailability }));
    };

    const addTimeSlot = (day: string) => {
        const newAvailability = { ...formData.jadwalKetersediaan };
        if (!newAvailability[day]) newAvailability[day] = [];
        newAvailability[day].push("");
        setFormData((prev) => ({ ...prev, jadwalKetersediaan: newAvailability }));
    };

    const removeTimeSlot = (day: string, index: number) => {
        const newAvailability = { ...formData.jadwalKetersediaan };
        if (newAvailability[day]) {
            newAvailability[day] = newAvailability[day].filter((_, i) => i !== index);
            if (newAvailability[day].length === 0) delete newAvailability[day];
        }
        setFormData((prev) => ({ ...prev, jadwalKetersediaan: newAvailability }));
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
                <CardTitle>Profile Information</CardTitle>
                {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={formData.profilePicture} />
                            <AvatarFallback>
                                {formData.specialization?.slice(0, 2).toUpperCase() || "TU"}
                            </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="picture" className="cursor-pointer">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                                        <Upload className="h-4 w-4" />
                                        {isUploading ? "Uploading..." : "Change Picture"}
                                    </div>
                                </Label>
                                <Input
                                    id="picture"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </div>
                        )}
                    </div>

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

                        {/* Availability Section */}
                        <div className="space-y-4">
                            <Label>Availability Hours</Label>
                            <div className="grid gap-4 border rounded-lg p-4">
                                {DAYS.map((day) => (
                                    <div key={day} className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{day}</span>
                                            {isEditing && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => addTimeSlot(day)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" /> Add Slot
                                                </Button>
                                            )}
                                        </div>
                                        {formData.jadwalKetersediaan[day]?.map((slot, index) => {
                                            const [start = "", end = ""] = slot.split("-");
                                            return (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        value={start}
                                                        onChange={(e) => {
                                                            const newStart = e.target.value;
                                                            const newSlot = `${newStart}-${end}`;
                                                            handleAvailabilityChange(day, index, newSlot);
                                                        }}
                                                        disabled={!isEditing}
                                                        className="w-[120px]"
                                                    />
                                                    <span>-</span>
                                                    <Input
                                                        type="time"
                                                        value={end}
                                                        onChange={(e) => {
                                                            const newEnd = e.target.value;
                                                            const newSlot = `${start}-${newEnd}`;
                                                            handleAvailabilityChange(day, index, newSlot);
                                                        }}
                                                        disabled={!isEditing}
                                                        className="w-[120px]"
                                                    />
                                                    {isEditing && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeTimeSlot(day, index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {(!formData.jadwalKetersediaan[day] ||
                                            formData.jadwalKetersediaan[day].length === 0) && (
                                                <p className="text-sm text-muted-foreground italic">
                                                    No availability set
                                                </p>
                                            )}
                                    </div>
                                ))}
                            </div>
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
                                            profilePicture: initialData.profilePicture || "",
                                            jadwalKetersediaan: initialData.jadwalKetersediaan || {} as Record<string, string[]>,
                                        });
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
