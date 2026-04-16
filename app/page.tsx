"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Database, FileCheck, ArrowRight, Zap } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Navigation */}
      <nav className="glass-panel fixed top-0 w-full z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/20">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">CAR-Bot</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-6 py-2.5 font-medium text-white transition duration-300 ease-out"
              >
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-blue bg-[length:200%_auto] animate-[pulse_4s_linear_infinite] rounded-full opacity-80 group-hover:opacity-100"></span>
                <span className="absolute inset-0 h-full w-full rounded-full border border-white/20"></span>
                <span className="relative flex items-center gap-2">
                  Get Started <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan mb-8">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-wide uppercase">Next-Gen Compliance</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight">
              Automated Intelligence for <br/>
              <span className="text-gradient">NDPA 2023 Compliance</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              CAR-Bot continuously audits your infrastructure, identifies PII vulnerabilities, and generates immaculate regulatory reports instantly. 
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
              >
                Start Free Audit <Shield className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      </main>

      {/* Features Section */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-black/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <FeatureCard
              icon={<Database className="h-8 w-8 text-brand-cyan" />}
              title="Universal Connectors"
              description="Integrate seamlessly with PostgreSQL, MongoDB, APIs, and cloud buckets. Zero-downtime integration."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-brand-purple" />}
              title="Real-Time Scanning"
              description="AI-driven PII identification and continuous compliance monitoring against stringent NDPA rules."
            />
            <FeatureCard
              icon={<FileCheck className="h-8 w-8 text-brand-pink" />}
              title="Automated Reporting"
              description="Generate cryptographically verifiable CAR reports ready for instant regulatory submission."
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
      className="glass-card p-8 rounded-2xl glow-border group cursor-pointer"
    >
      <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
        {description}
      </p>
    </motion.div>
  );
}
