"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const NAME_MAX = 60;
const USERNAME_MAX = 24;
const BIO_MAX = 280;
const LOCATION_MAX = 60;
const WEBSITE_MAX = 200;
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export default function EditProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();
  const me = useQuery(api.users.getCurrentUser, clerkUser ? {} : "skip");
  const updateProfile = useMutation(api.users.updateProfile);
  const updateProfileImage = useMutation(api.users.updateProfileImage);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!me || hydrated) return;
    setName(me.name || "");
    setUsername(me.username || "");
    setBio(me.bio || "");
    setLocation(me.location || "");
    setWebsite(me.website || "");
    setSkillsInput((me.skills ?? []).join(", "));
    setHydrated(true);
  }, [me, hydrated]);

  useEffect(() => {
    if (isLoaded && !clerkUser) router.push("/sign-in");
  }, [isLoaded, clerkUser, router]);

  const parsedSkills = skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);

  const usernameValid = /^[a-z0-9_]{3,24}$/i.test(username);
  const websiteValid = !website || /^https?:\/\//i.test(website);

  const canSave =
    !saving &&
    !uploadingImage &&
    hydrated &&
    name.trim().length > 0 &&
    name.trim().length <= NAME_MAX &&
    usernameValid &&
    bio.length <= BIO_MAX &&
    location.length <= LOCATION_MAX &&
    website.length <= WEBSITE_MAX &&
    websiteValid;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > IMAGE_MAX_BYTES) return toast.error("Image must be less than 5MB");
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImageIfNeeded = async (): Promise<boolean> => {
    if (!selectedImage) return true;
    setUploadingImage(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      if (!response.ok) throw new Error("upload failed");
      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
      await updateProfileImage({ imageStorageId: storageId });
      return true;
    } catch {
      toast.error("Failed to upload photo");
      return false;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      const photoOk = await uploadImageIfNeeded();
      if (!photoOk) return;

      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        skills: parsedSkills.length > 0 ? parsedSkills : undefined,
      });
      toast.success("Profile updated");
      if (me) router.push(`/profile/${me._id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(message.includes("already taken") ? "That username is taken" : message);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || me === undefined) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="h-5 w-1/3 rounded animate-shimmer" />
            <div className="h-10 w-full rounded animate-shimmer" />
            <div className="h-10 w-full rounded animate-shimmer" />
          </div>
        </main>
      </div>
    );
  }

  if (me === null) return null;

  const displayedImage = imagePreview || me.imageUrl || "/default-avatar.png";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">
            Update how others see you on TechConnect.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5">
            <label className="block text-sm font-medium text-foreground mb-3">
              Profile photo
            </label>
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={displayedImage}
                  alt={me.name}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-border"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {selectedImage ? "Choose different photo" : "Upload new photo"}
                  </button>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="inline-flex items-center px-3 h-9 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
                    >
                      Discard
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, or GIF. Max 5MB. Square images look best.
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Identity */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
            <Field label="Display name" hint={`${name.length} / ${NAME_MAX}`}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={NAME_MAX}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              />
            </Field>

            <Field
              label="Username"
              hint={
                username && !usernameValid
                  ? "3–24 chars, letters / numbers / underscore"
                  : `@${username || "username"}`
              }
              hintClass={username && !usernameValid ? "text-destructive" : undefined}
            >
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, "").toLowerCase())}
                maxLength={USERNAME_MAX}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              />
            </Field>

            <Field label="Bio" hint={`${bio.length} / ${BIO_MAX}`}>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={BIO_MAX}
                rows={3}
                placeholder="A short description about yourself"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition resize-none"
              />
            </Field>
          </div>

          {/* Details */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
            <Field label="Location" hint="Optional">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={LOCATION_MAX}
                placeholder="e.g. Bangalore, India"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              />
            </Field>

            <Field
              label="Website"
              hint={
                website && !websiteValid ? "Must start with http:// or https://" : "Optional"
              }
              hintClass={website && !websiteValid ? "text-destructive" : undefined}
            >
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                maxLength={WEBSITE_MAX}
                placeholder="https://yourdomain.com"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              />
            </Field>

            <Field label="Skills" hint="Comma separated, up to 12">
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, TypeScript, Convex"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
              />
              {parsedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parsedSkills.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-5 h-11 bg-accent text-accent-foreground border border-border rounded-full font-semibold hover:bg-muted hover:border-foreground/20 active:scale-[0.99] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave}
              className="flex-1 px-5 h-11 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 active:scale-[0.99] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImage
                ? "Uploading photo…"
                : saving
                ? "Saving…"
                : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  hint,
  hintClass,
  children,
}: {
  label: string;
  hint?: string;
  hintClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        {hint && (
          <span className={`text-xs ${hintClass ?? "text-muted-foreground"}`}>{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
