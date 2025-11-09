import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Workflow, Loader2 } from "lucide-react";

const Login = () => {
  // 2. Ubah state 'username' menjadi 'email'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 3. Ganti logika dummy auth dengan supabase.auth.signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    // 4. Tangani 'error' dari Supabase
    if (error) {
      toast.error(error.message || "Email atau password salah.");
      setIsLoading(false);
      return;
    }

    // Jika berhasil, 'data.session' akan terisi
    if (data.session) {
      toast.success("Login berhasil!");
      navigate("/dashboard"); // Arahkan ke dashboard
    } else {
      // Skenario jaga-jaga jika session tidak ada tapi tidak ada error
      toast.error("Gagal mendapatkan sesi. Silakan coba lagi.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-lg">
              <Workflow className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">n8n Workflow Monitor</CardTitle>
          <CardDescription>Masukkan kredensial Anda untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 5. Sesuaikan JSX untuk 'email' (bukan 'username') */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email" // Ubah tipe menjadi 'email'
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
