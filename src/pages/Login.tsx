// src/pages/Login.tsx
// The useEffect here now handles redirecting logged-in users.
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/contexts/ConfigContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store/store';

function Login() {
  const config = useConfig();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { status, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // This will run when the component loads *after* the AuthInitializer.
    // If the user is already authenticated, it will redirect immediately.
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Basic validation...
    if (!email || !password) return;
    dispatch(loginUser({ username: email, password }));
  };

  const isLoading = status === 'loading';

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={theme === "light" ? config.assets.logo.light : config.assets.logo.dark} alt="Logo" className="w-16 h-16 mx-auto mb-4" />
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" onChange={(e) => setEmail(e.target.value)} ref={emailInputRef} value={email} type="email" placeholder="john@example.com" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" onChange={(e) => setPassword(e.target.value)} ref={passInputRef} value={password} type={showPassword ? "text" : "password"} placeholder="••••••••" disabled={isLoading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;