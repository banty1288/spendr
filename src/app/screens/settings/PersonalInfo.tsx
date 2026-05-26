import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Loader2, Save, User, Mail, Phone, Camera } from "lucide-react";
import { useNavigate } from "react-router";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "../../../lib/firebase";
import { useAuthStore } from "../../../store/authStore";
import { useUserData } from "../../../hooks/useUserData";
import { useUpdateUser } from "../../../hooks/useUpdateUser";
import { toast } from "sonner";

export function PersonalInfo() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: userData, isLoading: isProfileLoading } = useUserData();
  const { updateUser, isUpdating } = useUpdateUser();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || "");
      setEmail(userData.email || "");
      setPhotoUrl(userData.profile?.avatarUrl || user?.photoURL || "");
      setPhone("");
    }
  }, [userData, user]);

  const handleSave = async () => {
    try {
      await updateUser({ 
        displayName, 
        profile: { ...userData?.profile, avatarUrl: photoUrl } as any 
      });
      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Create a canvas to compress the image
      const reader = new FileReader();
      
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = fileData;
      });

      const canvas = document.createElement("canvas");
      const MAX_SIZE = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL("image/webp", 0.7);

      // 2. Upload to Firebase Storage
      const storageRef = ref(storage, `users/${user.uid}/profile_pic.webp`);
      await uploadString(storageRef, compressedDataUrl, "data_url");
      const downloadUrl = await getDownloadURL(storageRef);

      // 3. Save to state & trigger save
      setPhotoUrl(downloadUrl);
      await updateUser({ profile: { ...userData?.profile, avatarUrl: downloadUrl } as any });
      
      toast.success("Avatar updated!");
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Failed to upload image. Please try a different image.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-[#00d9ff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-safe-nav relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">

      </div>

      <div className="relative z-10">
        <div className="px-6 pt-12 pb-6 sticky top-0 z-50  bg-background/30 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="bg-card shadow-sm p-3 rounded-full border border-border hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">Personal Info</h1>
            </div>
          </div>
        </div>

        <div className="px-6 mt-8 max-w-2xl mx-auto space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#00d9ff]/30 group-hover:border-[#00d9ff] transition-colors"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#00d9ff] to-[#00ff88] rounded-full flex items-center justify-center text-black text-3xl font-black">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              
              <label className="absolute bottom-0 right-0 p-2 bg-[#9d4edd] rounded-full text-white border-2 border-black hover:scale-110 transition-transform cursor-pointer">
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-white/60 text-sm mt-3">Tap to change avatar</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60 ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-white/40" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-card shadow-sm border border-border rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d9ff] transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60 ml-1">Email Address (Read-only)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-white/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-card shadow-sm border border-border rounded-2xl py-4 pl-12 pr-4 text-white/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60 ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={18} className="text-white/40" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-card shadow-sm border border-border rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d9ff] transition-colors"
                  placeholder="Add phone number"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black font-bold py-4 rounded-2xl shadow-lg shadow-[#00d9ff]/20 flex items-center justify-center gap-2 mt-8 disabled:opacity-70"
          >
            {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {isUpdating ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
