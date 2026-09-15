import { motion } from "framer-motion";
import {
  Navigation,
  Lightbulb,
  Layers,
  Cpu,
  Smartphone,
  Globe,
  Target,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Mail,
  ExternalLink,
  Users,
  Compass,
  CheckCircle2,
  Heart,
  Sparkles,
  Activity,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { transitions, variants } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function AboutCrownweb() {
  const [_, setLocation] = useLocation();

  const approach = [
    {
      title: "Understand",
      desc: "We start by deep-diving into the problem, defining users, and establishing clear product goals.",
      icon: Compass,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Design",
      desc: "We create simple, intuitive, and human-centric digital experiences that users love to interact with.",
      icon: Lightbulb,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Build",
      desc: "We turn complex ideas into reliable, high-performance, and scalable digital products.",
      icon: Cpu,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Improve",
      desc: "We believe a product is never finished. We continuously refine based on real-world usage.",
      icon: Zap,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    }
  ];

  const capabilities = [
    { title: "Websites", desc: "Modern, responsive, and performance-optimized.", icon: Globe },
    { title: "Web Applications", desc: "Complex functional platforms for business efficiency.", icon: Layers },
    { title: "Mobile Experiences", desc: "Native and hybrid apps with smooth interactions.", icon: Smartphone },
    { title: "Digital Platforms", desc: "Ecosystems that bring information and people together.", icon: Users }
  ];

  const values = [
    { title: "Innovation", desc: "Constant search for better ways to solve problems.", icon: Zap },
    { title: "Simplicity", desc: "Complex tech made understandable and usable.", icon: Target },
    { title: "Quality", desc: "Attention to detail in every line of code.", icon: ShieldCheck },
    { title: "Purpose", desc: "Building things that matter and add value.", icon: Heart },
    { title: "Continuity", desc: "Enduring support and product evolution.", icon: Users }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={variants.listContainer}
      className="p-4 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-16 pb-32"
    >
      {/* HERO SECTION */}
      <motion.section variants={variants.listItem} className="relative py-8 md:py-16 text-center space-y-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>

        <div className="space-y-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl border-4 border-white mb-4"
          >
             <Navigation className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase leading-none">
            Crownweb Agency
          </h1>
          <p className="text-lg md:text-xl font-bold text-primary italic max-w-2xl mx-auto leading-tight">
            Building Digital Experiences That Move People Forward.
          </p>
        </div>

        <p className="text-slate-500 font-medium max-w-md mx-auto text-base leading-relaxed">
          Crownweb Agency is the creative and technology engine behind Roadify.
          We specialize in turning visionary ideas into robust digital products.
        </p>

        <div className="pt-4">
           <Button className="h-12 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-black uppercase text-[10px] tracking-[0.2em] gap-3 shadow-lg">
             Explore Our Universe <ExternalLink className="w-3.5 h-3.5" />
           </Button>
        </div>
      </motion.section>

      {/* WHO WE ARE */}
      <motion.section variants={variants.listItem} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
         <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Who We Are</h2>
            <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
               <p>
                 At Crownweb, we are product thinkers, designers, and engineers dedicated to
                 the craft of building modern software. Our focus is on solving real problems
                 through exceptional user experience and reliable technology.
               </p>
               <p>
                 We help organizations navigate the digital landscape by turning complex
                 requirements into simple, intuitive products that scale with their goals.
               </p>
            </div>
            <div className="flex gap-4">
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1 text-center">
                  <p className="text-2xl font-black text-primary">10+</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Products Built</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-1 text-center">
                  <p className="text-2xl font-black text-primary">2024</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Year</p>
               </div>
            </div>
         </div>
         <div className="relative aspect-square bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1522071823991-b9671f9d7f1f?auto=format&fit=crop&q=80&w=2070"
              className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
              alt="Team at work"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent" />
         </div>
      </motion.section>

      {/* OUR APPROACH */}
      <motion.section variants={variants.listItem} className="space-y-10">
        <div className="text-center space-y-2">
           <h2 className="text-3xl font-black text-slate-900 uppercase">Our Approach</h2>
           <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">A methodology built for excellence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {approach.map((item, i) => (
             <Card key={i} className="border-0 shadow-lg ring-1 ring-slate-100 rounded-[2.5rem] bg-white group hover:ring-primary/20 transition-all">
                <CardContent className="p-8 space-y-6 text-center">
                   <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto transition-all group-hover:scale-110", item.bg, item.color)}>
                      <item.icon className="w-8 h-8" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{item.title}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>
      </motion.section>

      {/* WHAT WE BUILD */}
      <motion.section variants={variants.listItem} className="space-y-10">
        <div className="bg-slate-900 text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              <div className="space-y-6 lg:col-span-1">
                 <h2 className="text-4xl font-black uppercase leading-none">What We <br/>Build.</h2>
                 <p className="text-slate-400 font-medium leading-relaxed">
                   From simple landing pages to complex enterprise platforms,
                   we leverage cutting-edge tech to deliver results.
                 </p>
                 <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl font-bold gap-2">
                   Our Full Portfolio <ChevronRight className="w-4 h-4" />
                 </Button>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                 {capabilities.map((cap, i) => (
                   <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-4 group hover:bg-white/10 transition-all">
                      <div className="bg-primary/20 p-3 rounded-xl">
                        <cap.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                         <h4 className="font-bold text-white mb-1">{cap.title}</h4>
                         <p className="text-xs text-slate-400 font-medium leading-snug">{cap.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </motion.section>

      {/* ROADIFY CONNECTION */}
      <motion.section variants={variants.listItem} className="text-center py-20 bg-slate-50 rounded-[4rem] border border-slate-100 relative overflow-hidden">
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]" />
         <div className="space-y-10 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
               <div className="text-center">
                  <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white">
                     <Navigation className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The Creator</p>
                  <p className="font-black text-lg">Crownweb Agency</p>
               </div>

               <div className="hidden md:flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <div className="w-32 h-1 bg-gradient-to-r from-slate-200 to-primary/30 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-primary/30" />
               </div>

               <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white overflow-hidden">
                     <img src="/logo.png" alt="Roadify" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">The Product</p>
                  <p className="font-black text-lg">Roadify Master</p>
               </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">Built by Crownweb Agency.</h3>
               <p className="text-slate-500 font-medium text-lg italic">
                 "Roadify was born from our vision to make essential public information accessible,
                 modern, and easy to learn. It represents our commitment to building
                 products that serve the community."
               </p>
            </div>
         </div>
      </motion.section>

      {/* VALUES */}
      <motion.section variants={variants.listItem} className="space-y-12">
         <h2 className="text-3xl font-black text-slate-900 uppercase text-center">Core Values</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="flex items-start gap-5 p-2 group">
                 <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                    <v.icon className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-black text-lg uppercase tracking-tight text-slate-900 mb-1">{v.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{v.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </motion.section>

      {/* COMPLIANCE & STANDARDS */}
      <motion.section variants={variants.listItem} className="space-y-10">
        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-12 border border-slate-200/60 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={180} /></div>

           <div className="relative z-10 space-y-8">
              <div className="text-center md:text-left space-y-2">
                 <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Compliance & Standards</h2>
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Technical Architecture of Roadify Master</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Activity size={20} />
                       </div>
                       <h4 className="font-black text-slate-900 uppercase tracking-tight">Encryption Protocol: SADC-V2</h4>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                       Roadify leverages the <strong>SADC-V2 Encryption Protocol</strong> to secure curriculum transmission. This isn't just about security; it signifies our strict adherence to the
                       <strong> Southern African Development Community (SADC)</strong> harmonized road traffic standards.
                       Every question, sign, and rule in our database is verified against the latest regional traffic legislative frameworks.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                          <Cpu size={20} />
                       </div>
                       <h4 className="font-black text-slate-900 uppercase tracking-tight">Central Terminal Sync</h4>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                       The <strong>Terminal Online</strong> status represents a real-time link between your device and the VID simulation master-grid.
                       This architecture ensures that your simulation results are instantly validated and that you are always working with the most
                       up-to-date legislative amendments from the official Zimbabwe Highway Code curriculum.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </motion.section>

      {/* FOOTER & CONNECT */}
      <motion.section variants={variants.listItem} className="pt-20 border-t border-slate-100 text-center space-y-12">
         <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">Let's Connect</h2>
            <p className="text-slate-400 font-bold max-w-md mx-auto">Have a visionary idea? Let's turn it into a world-class digital experience.</p>
            <div className="flex flex-wrap justify-center gap-4">
               <Button className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest gap-3 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  <Mail className="w-4 h-4" /> hello@crownweb.co.zw
               </Button>
               <Button variant="outline" className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest gap-3 border-slate-200 hover:bg-slate-50 hover:scale-105 transition-all">
                  <Globe className="w-4 h-4" /> Agency Website
               </Button>
            </div>
         </div>

         <div className="space-y-8">
            <div className="flex justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
               <span className="hover:text-primary cursor-pointer transition-colors">Terms of Use</span>
               <span className="hover:text-primary cursor-pointer transition-colors">OS Licenses</span>
            </div>
            <div className="flex flex-col items-center gap-4">
               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-slate-300" />
               </div>
               <p className="text-xs font-bold text-slate-300">
                 © {new Date().getFullYear()} Crownweb Agency. All rights reserved.
                 <br className="md:hidden"/> Designed & Engineered in Zimbabwe.
               </p>
            </div>
         </div>
      </motion.section>
    </motion.div>
  );
}
