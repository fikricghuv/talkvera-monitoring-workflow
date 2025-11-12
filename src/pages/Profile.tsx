import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user) {
        const userProfile: UserProfile = {
          id: user.id,
          email: user.email || "",
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at || "",
          user_metadata: user.user_metadata || {},
        };
        
        setUser(userProfile);
        setFullName(userProfile.user_metadata.full_name || "");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Gagal memuat data profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;

      toast.success("Profile berhasil diperbarui!");
      fetchUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Harap isi password baru dan konfirmasi password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password berhasil diubah!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Gagal mengubah password");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* User Info Card Skeleton */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Name Skeleton */}
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            <Separator />

            {/* User Details Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-5 h-5 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Card Skeleton */}
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>

            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>

        {/* Change Password Card Skeleton */}
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[400px]">
        <p className="text-muted-foreground">Tidak dapat memuat data user</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Kelola informasi akun dan keamanan Anda</p>
      </div>

      {/* User Info Card */}
      <Card className="shadow-lg transition-shadow hover:shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informasi Pengguna
          </CardTitle>
          <CardDescription>Informasi dasar akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback className="text-xl">
                {getInitials(user.user_metadata.full_name || user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {user.user_metadata.full_name || "Nama belum diatur"}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono">{user.id.slice(0, 20)}...</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Terdaftar Sejak</p>
                <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Login Terakhir</p>
                <p className="text-sm text-muted-foreground">{formatDate(user.last_sign_in_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Card */}
      <Card className="shadow-lg transition-shadow hover:shadow-xl">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Perbarui informasi profile Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              placeholder="Masukkan nama lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
          </div>

          <Button onClick={handleUpdateProfile} disabled={isSaving}>
            {isSaving ? (
              <>
                <Skeleton className="w-4 h-4 mr-2 rounded-full" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="shadow-lg transition-shadow hover:shadow-xl">
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>Perbarui password untuk keamanan akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleChangePassword} 
            disabled={isSaving || !newPassword || !confirmPassword}
            variant="secondary"
          >
            {isSaving ? (
              <>
                <Skeleton className="w-4 h-4 mr-2 rounded-full" />
                Mengubah...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Ubah Password
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;