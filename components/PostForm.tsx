"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import toast from "react-hot-toast";

const MAX_LEN = 1000;

export default function PostForm() {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const parsedTags = tags
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be less than 5MB");
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setText("");
      setTags("");
      removeImage();
      toast.success("Post created!");
    } catch {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const overLimit = text.length > MAX_LEN * 0.9;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-5 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <img
            src={user?.imageUrl || "/default-avatar.png"}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-border flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind? (markdown supported)"
              maxLength={MAX_LEN}
              rows={3}
              className="w-full bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground text-[15px] leading-relaxed"
            />

            {imagePreview && (
              <div className="relative mt-2 rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-cover" />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm gap-2">
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading…
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 h-8 w-8 inline-flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags: react, javascript, ai…"
              className="w-full bg-transparent border-0 outline-none text-sm text-muted-foreground placeholder:text-muted-foreground/70 mt-2"
            />
            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parsedTags.map((t) => (
                  <span key={t} className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Photo</span>
            </label>
            <span className={`text-xs ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
              {text.length}/{MAX_LEN}
            </span>
          </div>
          <button
            type="submit"
            disabled={!text.trim() || isPosting || isUploading}
            className="bg-primary text-primary-foreground px-5 h-9 rounded-full text-sm font-semibold transition active:scale-95 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isUploading ? "Uploading…" : isPosting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
