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

function Login() {
  const config = useConfig();
  const { theme } = useTheme();

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img
            src={theme === 'light' ? config.assets.logo.light : config.assets.logo.dark}
            alt="Logo"
            className="w-16 h-16 mx-auto mb-4"
          />
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </div>
        </CardContent>
        <CardContent>
          <Button className="w-full">Sign In</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;