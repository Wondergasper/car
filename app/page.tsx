"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Database, FileCheck, ArrowRight, Zap, CheckCircle2, Lock, Server, Globe } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-background font-sans overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-blue/20 blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-brand-purple/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-brand-cyan/20 blur-[130px] mix-blend-screen animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      </div>

      {/* Navigation */}
      <nav className="glass-panel sticky top-0 w-full z-50 border-b border-white/5 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center shadow-[0_0_20px_rgba(0,112,243,0.3)]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-sm">CAR<span className="text-brand-blue">-</span>Bot</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <span className="text-sm font-medium text-gray-300 hover:text-white cursor-pointer transition-colors">Features</span>
              <span className="text-sm font-medium text-gray-300 hover:text-white cursor-pointer transition-colors">Compliance</span>
              <span className="text-sm font-medium text-gray-300 hover:text-white cursor-pointer transition-colors">Enterprise</span>
            </div>

            <div className="flex items-center gap-5">
              <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-px font-medium text-white transition-transform hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-cyan animate-[pulse-slow_4s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity"></span>
                <div className="relative flex items-center gap-2 bg-black/50 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10">
                  <span className="tracking-wide text-sm font-semibold text-white">Get Started</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(0,223,216,0.1)]">
              <Zap className="h-4 w-4 drop-shadow-[0_0_8px_rgba(0,223,216,0.8)]" />
              <span className="text-xs font-bold tracking-widest uppercase">Intelligent Audit Engine</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[1.1] drop-shadow-lg">
              Compliance, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400">Automated Intelligently.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              The enterprise-grade platform that continuously audits your data infrastructure, auto-detects PII vulnerabilities, and enforces <strong className="text-white font-semibold">NDPA 2023</strong> & <strong className="text-white font-semibold">GAID 2025</strong> rules.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3"
              >
                Start Free Audit <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center backdrop-blur-sm"
              >
                View Documentation
              </Link>
            </motion.div>
          </motion.div>

          {/* Abstract Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 relative mx-auto max-w-6xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-full w-full top-1/2"></div>
            <div className="glass-card rounded-2xl border border-white/10 p-2 overflow-hidden shadow-2xl relative bg-black/40">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent"></div>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="h-6 w-full max-w-sm bg-white/5 rounded-md flex items-center px-3 border border-white/5">
                    <Lock className="w-3 h-3 text-brand-cyan mr-2" />
                    <span className="text-xs text-gray-500 font-mono">secure.car-bot.ai/dashboard</span>
                  </div>
                </div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-[#0a0a0a] to-[#111] p-8 grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div className="h-8 w-1/3 bg-white/10 rounded-lg animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-32 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                       <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-cyan"></div>
                    </div>
                    <div className="h-32 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                       <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-purple to-brand-pink"></div>
                    </div>
                  </div>
                  <div className="h-64 bg-white/5 rounded-xl border border-white/5"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-full bg-white/5 rounded-xl border border-white/5"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Social Proof */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02] relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">Trusted by data-forward enterprises</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex items-center gap-2 font-bold text-xl text-white"><Globe className="h-6 w-6"/> DataCorp</div>
             <div className="flex items-center gap-2 font-bold text-xl text-white"><Server className="h-6 w-6"/> Securiti.ai</div>
             <div className="flex items-center gap-2 font-bold text-xl text-white"><Shield className="h-6 w-6"/> TrustFlow</div>
             <div className="flex items-center gap-2 font-bold text-xl text-white"><Database className="h-6 w-6"/> Vertex</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Designed for strict compliance</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Leave manual checklists behind. CAR-Bot integrates direct into your data plane, analyzing and remediating policy violations in real-time.</p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <FeatureCard
              icon={<Database className="h-8 w-8 text-brand-cyan drop-shadow-[0_0_10px_rgba(0,223,216,0.8)]" />}
              title="Universal Data Connectors"
              description="Integrate seamlessly with PostgreSQL, MongoDB, BigQuery, AWS S3, and standard APIs. Zero-downtime, non-intrusive integration."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-brand-purple drop-shadow-[0_0_10px_rgba(121,40,202,0.8)]" />}
              title="Real-Time Detection"
              description="AI-driven PII identification and continuous compliance monitoring against strictly enforced NDPA 2023 frameworks."
            />
            <FeatureCard
              icon={<FileCheck className="h-8 w-8 text-brand-blue drop-shadow-[0_0_10px_rgba(0,112,243,0.8)]" />}
              title="Automated Reporting"
              description="Generate cryptographically verifiable CAR reports on a customized schedule, ready for instant regulatory body submission."
            />
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative z-10 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-blue/10"></div>
         <div className="mx-auto max-w-4xl px-4 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to secure your data?</h2>
            <p className="text-xl text-gray-400 mb-10">Join the thousands of developers building compliant applications with CAR-Bot.</p>
            <Link
              href="/register"
              className="px-10 py-5 rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(0,223,216,0.4)] transition-all inline-block hover:-translate-y-1"
            >
              Start Your Free Assessment
            </Link>
         </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
      }}
      className="glass-card p-8 rounded-3xl glow-border group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
        {icon}
      </div>
      <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500 group-hover:bg-white/10">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-400 leading-relaxed font-light group-hover:text-gray-300 transition-colors">
        {description}
      </p>
      
      <div className="pt-8 mt-4 border-t border-white/5 flex items-center text-sm font-medium text-brand-cyan opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        Learn more <ArrowRight className="ml-2 h-4 w-4" />
      </div>
    </motion.div>
  );
}
