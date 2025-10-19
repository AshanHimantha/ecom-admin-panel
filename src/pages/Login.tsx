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
import { useState,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, getCurrentUser } from "@aws-amplify/auth";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const config = useConfig();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();


  const handleSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // basic validation feedback
    if (email === "" || !emailRegex.test(email)) {
      emailInputRef.current?.classList.add("border-red-500");
      setLoading(false);
      return;
    } else {
      emailInputRef.current?.classList.remove("border-red-500");
    }

    if (password === "") {
      passInputRef.current?.classList.add("border-red-500");
      setLoading(false);
      return;
    } else {
      passInputRef.current?.classList.remove("border-red-500");
    }

    try {
      console.log("Attempting sign in with:", { username: email });
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password: password,
      });
      console.log("Sign in response:", { isSignedIn, nextStep });

      if (isSignedIn) {
        setMessage("Successfully signed in!");
        try {
          const user = await getCurrentUser();
          console.log("Current user:", user);
          // TODO: place any post sign-in logic here (e.g., context/store updates)
        } catch (postSignInError) {
          console.warn("Post sign-in tasks failed:", postSignInError);
        }
        // Navigate to dashboard on success
        navigate("/dashboard", { replace: true });
      } else if ((nextStep as any)?.signInStep === "CONFIRM_SIGN_UP") {
        setIsConfirming(true);
        setMessage("Please check your email for verification code");
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err?.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src={
              theme === "light"
                ? config.assets.logo.light
                : config.assets.logo.dark
            }
            alt="Logo"
            className="w-16 h-16 mx-auto mb-4"
          />
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                onChange={(e) => setEmail(e.target.value)}
                 ref={emailInputRef}
                value={email}
                type="email"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <div className="flex justify-between relative">
                <Input
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Password"
                  ref={passInputRef}
                  value={password}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSignIn();
                  }}
                />
                {showPassword ? (
                  <EyeOff
                    onClick={() => setShowPassword(!showPassword)}
                    className="w-3 absolute right-3 top-1/2 transform -translate-y-1/2"
                  />
                ) : (
                  <Eye
                    onClick={() => setShowPassword(!showPassword)}
                    className="w-3 absolute right-3 top-1/2 transform -translate-y-1/2"
                  />
                )}
              </div>
            </div>
            {(error || message) && (
              <div className="text-sm">
                {error && <p className="text-red-600">{error}</p>}
                {message && <p className="text-green-600">{message}</p>}
              </div>
            )}
          </div>
        </CardContent>
        <CardContent>
          <Button className="w-full" disabled={loading} onClick={() => {handleSignIn();}}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
