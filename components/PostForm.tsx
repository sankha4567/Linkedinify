"use client";
import { useUser} from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState,useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";

const PostForm = () => {
  const {user}=useUser();
  const [text,setText]=useState("");
  const [tags,setTags]=useState("");
  const [isPosting,setIsPosting]=useState(false);
  const [selectedImage,setSelectedImage]=useState<File | null>(null);
  const [imagePreview,setImagePreview]=useState<string | null>(null);
  const [isUploading,setIsUploading]=useState(false);
  const imageInputRef=useRef<HTMLInputElement>(null);
  const createPost=useMutation(api.posts.createPost);
  const generateUploadUrl=useMutation(api.files.generateUploadUrl);
  const fileInputRef=useRef<HTMLInputElement>(null);
  const handleImageSelect=(e: React.ChangeEvent<HTMLInputElement>)=>{
   const file=e.target.files?.[0];
   if(!file){
    return;
   }
   if(!file.type.startsWith("image/")){
    alert("Please select an image file");
    return;
   }
   if(file.size > 5 * 1024 *1024){
    alert("Image must be less than 5MB");
      return;
   }
   setSelectedImage(file);
   const reader=new FileReader();
   reader.onload=(e)=>setImagePreview(e.target?.result as string);
   reader.readAsDataURL(file);
  }
  const removeImage=()=>{
    setSelectedImage(null);
    setImagePreview(null);
    if(imageInputRef.current){
      imageInputRef.current.value="";
    }
  }
  const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!user || !text.trim()){
      return;
    }
    setIsPosting(true);
    try{
       let imageStorageId:Id<"_storage">|undefined;
       if (selectedImage) {
        const storageId = await uploadImage();
        if (storageId) imageStorageId = storageId;
      }
      const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);
      await createPost({
        clerkId:user.id,
        text:text.trim(),
        imageStorageId,
        tags:tagsArray
      });
      setText("");
      setTags("");
      removeImage();
      alert("Post created successfully");
    }catch(error){
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }finally{
      setIsPosting(false);
    }
  }
  const uploadImage=async()=>{
     if(!selectedImage){
      return null;
     }
     setIsUploading(true);
     try{
      const uploadUrl=await generateUploadUrl();
      const response=await fetch(uploadUrl,{
        method:"POST",
        headers:{"Content-Type":selectedImage.type},
        body:selectedImage,
      });
      if(!response.ok){
        throw new Error("Failed to upload image");
      }
      const {storageId}=await response.json();
      return storageId;

     }catch(error){
      console.error("Error uploading image:", error);
      return null;
     }finally{
      setIsUploading(false);
     }
     
  }
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <img src={user?.imageUrl || "/default-avatar.png"} alt="Avatar" className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind? Share your tech thoughts..."
              className="w-full border-0 focus:ring-0 resize-none text-gray-800 placeholder-gray-400"
              rows={3}
            />
            {imagePreview && (
              <div className="relative mt-3 rounded-xl overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated): react, javascript, ai"
              className="w-full border-0 focus:ring-0 text-sm text-gray-600 placeholder-gray-400 mt-2"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t">
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="image-upload" />
            <label htmlFor="image-upload" className="flex items-center gap-2 text-gray-500 hover:text-blue-500 cursor-pointer transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Photo</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={!text.trim() || isPosting || isUploading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PostForm
