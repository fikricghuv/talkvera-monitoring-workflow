import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";


const ModernWaveBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vh]"
        viewBox="0 0 2000 1200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 0.15 }} />
            <stop offset="100%" style={{ stopColor: "#1d4ed8", stopOpacity: 0.05 }} />
          </linearGradient>

          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#60a5fa", stopOpacity: 0.25 }} />
            <stop offset="100%" style={{ stopColor: "#93c5fd", stopOpacity: 0.1 }} />
          </linearGradient>

          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#1e40af", stopOpacity: 0.1 }} />
            <stop offset="100%" style={{ stopColor: "#3b82f6", stopOpacity: 0.03 }} />
          </linearGradient>
        </defs>

        {/* Blob 1 */}
        <motion.path
          fill="url(#gradient2)"
          d="M0,0 L0,600 Q400,750 1000,600 T2000,450 L2000,0 Z"
          initial={{ y: -70, x: -100 }}
          animate={{ y: [0, -70, 0], x: [-100, 0, -100] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Blob 2 */}
        <motion.path
          fill="url(#gradient1)"
          d="M0,0 L0,300 Q300,450 700,300 T2000,150 L2000,0 Z"
          initial={{ y: 70, x: -50 }}
          animate={{ y: [0, 70, 0], x: [-50, 50, -50] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Blob 3 */}
        <motion.path
          fill="url(#gradient3)"
          d="M0,1200 L0,900 Q400,750 1000,900 T2000,1050 L2000,1200 Z"
          initial={{ y: 70, x: 100 }}
          animate={{ y: [0, 90, 0], x: [100, 0, 100] }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
      </svg>
    </div>
  );
};


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Email atau password salah.");
      setIsLoading(false);
      return;
    }

    if (data.session) {
      toast.success("Login berhasil!");
      navigate("/dashboard");
    } else {
      toast.error("Gagal mendapatkan sesi. Silakan coba lagi.");
    }

    setIsLoading(false);
  };


  const isButtonDisabled = isLoading;

  return (
    // Pastikan padding cukup di mobile (p-4)
    <div className="relative min-h-screen flex items-center justify-center bg-white p-4 overflow-hidden">

      {/* Background Gelombang */}
      <ModernWaveBackground />

      {/* Card Fade + Slide Up: Tambahkan z-10 agar Card di atas Background */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-md md:max-w-lg lg:max-w-lg" // Mengubah ukuran card, responsif
      >
        {/* Card: Sudut membulat tegas dan shadow biru lembut */}
        <Card className="w-full border-0 rounded-2xl shadow-xl shadow-blue-200/50 p-6 md:p-8"> {/* Padding card disesuaikan */}

          <CardHeader className="space-y-1 text-center pt-4 md:pt-6"> {/* Padding header disesuaikan */}
            <motion.div
              className="flex justify-center mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {/* Logo: Ukuran logo juga bisa disesuaikan jika perlu */}
              <div className="p-1">
                <img 
                  src="/assets/logo-talkvera.png"
                  alt="Logo TalkVera"
                  className="w-16 h-16 object-contain transition-transform duration-300 hover:scale-105" // Ukuran logo sedikit diperbesar
                />
              </div>
            </motion.div>

            <CardTitle className="text-3xl md:text-4xl font-extrabold text-gray-800 pt-2">Selamat Datang</CardTitle>
            <CardDescription className="text-gray-500 text-base md:text-lg">Masuk ke Talkvera Dashboard Anda</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6 md:space-y-8"> {/* Spacing form disesuaikan */}
              
              {/* --- Field Email --- */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>

                <motion.input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-11 md:h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 focus:shadow-md"
                  whileFocus={{ scale: 1.005, boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.25)" }} // Efek fokus yang lebih halus
                />
              </div>

              {/* --- Field Password --- */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>

                <motion.input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex h-11 md:h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 focus:shadow-md"
                    whileFocus={{ scale: 1.005, boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.25)" }} // Efek fokus yang lebih halus
                  />
              </div>

              {/* --- Button Login (Biru Kuat) --- */}
              <motion.div whileHover={{ scale: isButtonDisabled ? 1 : 1.03 }} whileTap={{ scale: isButtonDisabled ? 1 : 0.98 }}>
                <Button 
                  type="submit" 
                  className="w-full h-11 md:h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/50 transition-all duration-200 text-base" 
                  disabled={isButtonDisabled}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <span className="flex items-center justify-center">
                        Login ke Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;