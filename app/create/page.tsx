"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

const MAX_LEN = 1000;

export default function CreatePage() {
  const { user } = useUser();
  const router = useRouter();
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const parsedTags = tags
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

  const overLimit = text.length > MAX_LEN * 0.9;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be less than 5MB");
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (): Promise<Id<"_storage"> | null> => {
    if (!selectedImage) return null;
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      if (!response.ok) throw new Error("upload failed");
      const { storageId } = await response.json();
      return storageId;
    } catch {
      toast.error("Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setIsPosting(true);
    try {
      let imageStorageId: Id<"_storage"> | undefined;
      if (selectedImage) {
        const storageId = await uploadImage();
        if (storageId) imageStorageId = storageId;
      }
      await createPost({
        text: text.trim(),
        imageStorageId,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
      });
      toast.success("Post created!");
      router.push("/");
    } catch {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Post</h1>
          <p className="text-muted-foreground mt-1">Share something with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              What&apos;s on your mind?
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts, insights, or questions…"
              rows={6}
              maxLength={MAX_LEN}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition resize-none"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-muted-foreground">
                Markdown supported: <code className="bg-muted px-1 rounded">**bold**</code>, <code className="bg-muted px-1 rounded">*italic*</code>, <code className="bg-muted px-1 rounded">[link](url)</code>, <code className="bg-muted px-1 rounded">`code`</code>, lists
              </span>
              <span className={`text-xs font-medium ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
                {text.length} / {MAX_LEN}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Image <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full max-h-96 object-cover" />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm gap-2">
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading…
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 h-9 w-9 inline-flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition group"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition">
                  <svg className="h-6 w-6 text-muted-foreground group-hover:text-primary transition" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-foreground font-medium">Click to upload an image</p>
                <p className="text-sm text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, javascript, ai (comma separated)"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
            />
            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parsedTags.map((t) => (
                  <span key={t} className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-5 h-11 bg-accent text-accent-foreground border border-border rounded-full font-semibold hover:bg-muted hover:border-foreground/20 active:scale-[0.99] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || isPosting || isUploading}
              className="flex-1 px-5 h-11 bg-primary text-primary-foreground rounded-full font-semibold hover:opacity-90 active:scale-[0.99] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading…" : isPosting ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
