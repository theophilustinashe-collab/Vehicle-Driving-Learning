import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Signpost, Car, ShieldCheck, Mail, Lock, User, ArrowRight, Trophy, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  city: z.string().min(2, "City must be at least 2 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export default function Home() {
  const [_, setLocation] = useLocation();
  const { data: user } = useGetMe();
  const login = useLogin();
  const register = useRegister();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", city: "", password: "" },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    login.mutate(
      { data },
      {
        onSuccess: (res) => {
          localStorage.setItem("vid_token", res.token);
          window.location.href = "/dashboard";
        },
        onError: (err) => {
          toast({
            title: "Login Failed",
            description: err.message || "Invalid credentials",
            variant: "destructive",
          });
        },
      }
    );
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    register.mutate(
      { data },
      {
        onSuccess: (res) => {
          localStorage.setItem("vid_token", res.token);
          window.location.href = "/dashboard";
        },
        onError: (err) => {
          toast({
            title: "Registration Failed",
            description: err.message || "Could not create account",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden relative">
      {/* Background Image for the whole page */}
      <div
        className="absolute inset-0 z-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `url('/login-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(1.1) contrast(1.05)'
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#0f172a]/40 to-transparent pointer-events-none" />

      {/* Left branding panel */}
      <div className="bg-[#0f172a]/90 backdrop-blur-sm flex-1 p-8 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden hidden md:flex z-10">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg shadow-primary/20">
              <Signpost className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">VID Master</h1>
              <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase opacity-80">Zimbabwe</p>
            </div>
          </motion.div>

          <div className="space-y-8 max-w-lg mt-12">
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight"
            >
              Master the Road, <br/>
              <span className="text-primary italic">Ace the Test.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-400 font-medium leading-relaxed"
            >
              The most advanced preparation platform for the Zimbabwe Provisional Driver's Licence.
            </motion.p>

            <div className="space-y-6 pt-12">
              {[
                { icon: ShieldCheck, title: "Official Curriculum", desc: "100% aligned with VID standards." },
                { icon: Car, title: "Exam Simulator", desc: "Realistic 8-minute timed practice tests." },
                { icon: Trophy, title: "Leaderboard", desc: "Compete with other learners across Zimbabwe." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  className="flex items-start gap-4"
                >
                  <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="relative z-10 text-xs font-medium tracking-wide"
        >
          © {new Date().getFullYear()} VID Master Zimbabwe • Trusted by thousands of learners.
        </motion.div>
      </div>

      {/* Mobile Branding (only visible on small screens) */}
      <div className="md:hidden bg-[#0f172a] p-6 flex items-center justify-between text-white border-b border-white/10">
        <div className="flex items-center gap-2">
          <Signpost className="w-6 h-6 text-primary" />
          <span className="font-black text-xl tracking-tighter">VID Master</span>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50/50 backdrop-blur-sm relative overflow-hidden z-10">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="shadow-2xl shadow-slate-200 border-slate-200 overflow-hidden">
            <CardHeader className="space-y-2 text-center pb-8 pt-8 bg-white border-b border-slate-100">
              <CardTitle className="text-3xl font-black tracking-tight text-slate-900">
                {activeTab === "login" ? "Welcome Back" : "Start Learning"}
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium text-base px-4">
                {activeTab === "login"
                  ? "Enter your credentials to access your dashboard."
                  : "Join thousands of successful learners today."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 h-12">
                  <TabsTrigger value="login" className="font-bold data-[state=active]:shadow-md">Login</TabsTrigger>
                  <TabsTrigger value="register" className="font-bold data-[state=active]:shadow-md">Register</TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: activeTab === "login" ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: activeTab === "login" ? 10 : -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="login" className="mt-0 outline-none">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-slate-700 font-bold">Email Address</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input placeholder="name@example.com" className="pl-10 h-11 border-slate-200 focus:ring-primary/20" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <FormLabel className="text-slate-700 font-bold">Password</FormLabel>
                                  <Button variant="link" className="text-xs h-auto p-0 font-bold text-primary" type="button">Forgot password?</Button>
                                </div>
                                <FormControl>
                                  <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input type="password" placeholder="••••••••" className="pl-10 h-11 border-slate-200 focus:ring-primary/20" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full h-12 mt-4 font-black text-base shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all" disabled={login.isPending}>
                            {login.isPending ? "Signing in..." : (
                              <span className="flex items-center gap-2">
                                Sign In <ArrowRight className="w-4 h-4" />
                              </span>
                            )}
                          </Button>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 font-bold border-slate-200 hover:bg-slate-50 gap-3"
                            onClick={() => {
                              toast({
                                title: "Google Login",
                                description: "Google authentication is being initialized. Redirecting...",
                              });
                            }}
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.38v2.81h3.59c2.1-1.93 3.31-4.77 3.31-8.2z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                            Continue with Google
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>

                    <TabsContent value="register" className="mt-0 outline-none">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-slate-700 font-bold">Full Name</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <User className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input placeholder="John Doe" className="pl-10 h-11 border-slate-200 focus:ring-primary/20" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-slate-700 font-bold">Email Address</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input placeholder="name@example.com" className="pl-10 h-11 border-slate-200 focus:ring-primary/20" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-slate-700 font-bold">City / Location</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input placeholder="e.g. Harare, Bulawayo" className="pl-10 h-11 border-slate-200 focus:ring-primary/20" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-slate-700 font-bold">Password</FormLabel>
                                <FormControl>
                                  <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <Input type="password" placeholder="••••••••" className="pl-10 h-11 border-slate-200 focus:ring-primary/20" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full h-12 mt-4 font-black text-base shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all" disabled={register.isPending}>
                            {register.isPending ? "Creating account..." : (
                              <span className="flex items-center gap-2">
                                Create Account <ArrowRight className="w-4 h-4" />
                              </span>
                            )}
                          </Button>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white px-2 text-slate-400 font-bold">Or register with</span>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 font-bold border-slate-200 hover:bg-slate-50 gap-3"
                            onClick={() => {
                              toast({
                                title: "Google Signup",
                                description: "Google authentication is being initialized. Redirecting...",
                              });
                            }}
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.38v2.81h3.59c2.1-1.93 3.31-4.77 3.31-8.2z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                            Continue with Google
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Official Preparation Partner</p>
                <div className="flex justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="bg-slate-200 h-8 w-24 rounded flex items-center justify-center font-black text-[10px] text-slate-500">VID ZIMBABWE</div>
                  <div className="bg-slate-200 h-8 w-24 rounded flex items-center justify-center font-black text-[10px] text-slate-500">TSC ZIMBABWE</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
