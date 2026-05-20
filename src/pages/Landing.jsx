// src/pages/Landing.jsx
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  MessageCircle, 
  PenTool, 
  Headphones, 
  Award, 
  Zap,
  ChevronRight,
  X
} from 'lucide-react';

export default function Landing() {
  const { t, setUiLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 模态框打开时禁止背景滚动
  useEffect(() => {
    if (isVideoModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVideoModalOpen]);

  const openVideoModal = () => setIsVideoModalOpen(true);
  const closeVideoModal = () => setIsVideoModalOpen(false);

  const features = [
    { icon: MessageCircle, title: 'Oral Practice', desc: 'AI-powered conversation practice', color: 'from-blue-500 to-blue-600' },
    { icon: PenTool, title: 'Essay Correction', desc: 'Instant grammar feedback', color: 'from-purple-500 to-purple-600' },
    { icon: Headphones, title: 'Listening Training', desc: 'Improve comprehension', color: 'from-emerald-500 to-emerald-600' },
    { icon: Award, title: 'Smart Feedback', desc: 'Personalized learning path', color: 'from-amber-500 to-amber-600' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* 导航栏 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl text-foreground">LinguMate</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#languages" className="text-muted-foreground hover:text-foreground transition">Languages</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">Pricing</a>
          </div>
          
          <Link to="/login">
            <Button className="rounded-full px-6">
              Get Started
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Language Learning</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Master Any Language
              <span className="text-primary"> with AI</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Practice speaking, writing, listening and reading with our intelligent AI tutor.
              Get real-time feedback and improve faster than ever.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="rounded-full px-8 text-base gap-2">
                  Start Free Trial
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              {/* Watch Demo 按钮 - 点击打开视频模态框 */}
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 text-base"
                onClick={openVideoModal}
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 功能特性 */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Learn
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive language learning tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-all border-0 shadow-sm">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 语言支持 */}
      <section id="languages" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              10+ Languages Supported
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You now have a chance to Learn multiple languages from major world languages to regional ones in one stop platform
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {languages.map(lang => (
              <div
                key={lang.code}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-border"
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium text-foreground">{lang.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
              <span className="text-sm text-muted-foreground">+ more</span>
            </div>
          </div>
        </div>
      </section>

      {/* 定价预览 */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your learning journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <Card className="p-6 text-center border-0 shadow-sm">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-4">S$0</div>
              <p className="text-sm text-muted-foreground mb-6">Basic features to get started</p>
              <Link to="/login">
                <Button variant="outline" className="w-full rounded-full">Get Started</Button>
              </Link>
            </Card>
            
            {/* Pro */}
            <Card className="p-6 text-center border-0 shadow-lg ring-2 ring-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg">
                Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-2">S$9.9</div>
              <p className="text-sm text-muted-foreground mb-6">SGD / month</p>
              <Link to="/login">
                <Button className="w-full rounded-full">Start Pro Trial</Button>
              </Link>
            </Card>
            
            {/* Premium */}
            <Card className="p-6 text-center border-0 shadow-sm">
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <div className="text-3xl font-bold mb-2">S$19.9</div>
              <p className="text-sm text-muted-foreground mb-6">SGD / month</p>
              <Link to="/login">
                <Button variant="outline" className="w-full rounded-full">Go Premium</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 底部 */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2026 LinguMate. All rights reserved.</p>
        </div>
      </footer>

      {/* 视频模态框 */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeVideoModal}
        >
          <div 
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* 视频播放器 */}
            <video
              className="w-full h-auto max-h-[80vh]"
              controls
              autoPlay
              src="https://aivana-omnimart-sg.oss-ap-southeast-1.aliyuncs.com/langumate/demo/Lingumate%20Demo.mov"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}