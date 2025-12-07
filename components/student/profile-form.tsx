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
import { Loader2, Upload } from "lucide-react";

interface StudentProfileFormProps {
    studentId: number;
    userId: number;
    initialData: {
        educationLevel: string | null;
        interests: string | null;
        profilePicture: string | null;
    };
}

export function StudentProfileForm({ studentId, userId, initialData }: StudentProfileFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        educationLevel: initialData.educationLevel || "",
        interests: initialData.interests || "",
        profilePicture: initialData.profilePicture || "",
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // We need an API to update student profile. 
            // Assuming /api/students/[id] exists or we need to create it.
            // Let's check if it exists or create it.
            // For now, I'll assume I need to create it or use a similar pattern.
            // I'll use /api/students/${studentId} and ensure it exists.
            const response = await fetch(`/api/students/${studentId}`, {
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
                            <AvatarFallback>ST</AvatarFallback>
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
                            <Label htmlFor="educationLevel">Education Level</Label>
                            <Input
                                id="educationLevel"
                                name="educationLevel"
                                value={formData.educationLevel}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="e.g. High School, Undergraduate"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="interests">Interests</Label>
                            <Textarea
                                id="interests"
                                name="interests"
                                value={formData.interests}
                                onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="e.g. Math, Programming, Music"
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
                                            educationLevel: initialData.educationLevel || "",
                                            interests: initialData.interests || "",
                                            profilePicture: initialData.profilePicture || "",
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
