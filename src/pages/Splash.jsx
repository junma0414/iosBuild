// src/pages/Splash.jsx
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // 地球动画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let rotation = 0;
    
    // 设置 canvas 尺寸
    const setSize = () => {
      const container = canvas.parentElement;
      const size = Math.min(container.clientWidth, 400);
      canvas.width = size;
      canvas.height = size;
    };
    setSize();
    window.addEventListener('resize', setSize);
    
    // 语言节点数据
    const languages = [
      { name: 'English', flag: '🇬🇧', x: 0.85, y: 0.3, color: '#3B82F6' },
      { name: '中文', flag: '🇨🇳', x: 0.7, y: 0.4, color: '#EF4444' },
      { name: '日本語', flag: '🇯🇵', x: 0.75, y: 0.5, color: '#EC4899' },
      { name: '한국어', flag: '🇰🇷', x: 0.8, y: 0.6, color: '#06B6D4' },
      { name: 'Español', flag: '🇪🇸', x: 0.3, y: 0.35, color: '#F59E0B' },
      { name: 'Français', flag: '🇫🇷', x: 0.25, y: 0.5, color: '#8B5CF6' },
      { name: 'Português', flag: '🇵🇹', x: 0.35, y: 0.65, color: '#10B981' },
      { name: 'Bahasa', flag: '🇲🇾', x: 0.65, y: 0.7, color: '#F97316' },
      { name: 'Deutsch', flag: '🇩🇪', x: 0.2, y: 0.4, color: '#6366F1' },
      { name: 'Italiano', flag: '🇮🇹', x: 0.15, y: 0.55, color: '#14B8A6' },
      { name: 'Русский', flag: '🇷🇺', x: 0.4, y: 0.25, color: '#A855F7' },
      { name: 'العربية', flag: '🇸🇦', x: 0.55, y: 0.2, color: '#EAB308' },
    ];
    
    // 地球纹理（创建渐变球体）
    const drawEarth = (ctx, cx, cy, radius, rot) => {
      // 地球渐变
      const gradient = ctx.createLinearGradient(cx - radius * 0.5, cy - radius * 0.5, cx + radius * 0.5, cy + radius * 0.5);
      gradient.addColorStop(0, '#4F46E5');
      gradient.addColorStop(0.5, '#3B82F6');
      gradient.addColorStop(1, '#06B6D4');
      
      // 地球阴影
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // 大陆轮廓（简化）
      ctx.beginPath();
      ctx.ellipse(cx + radius * 0.2 * Math.sin(rot), cy - radius * 0.1, radius * 0.3, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(cx - radius * 0.15 * Math.cos(rot), cy + radius * 0.15, radius * 0.2, radius * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(cx + radius * 0.05, cy - radius * 0.25, radius * 0.22, radius * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 高光
      ctx.beginPath();
      ctx.ellipse(cx - radius * 0.3, cy - radius * 0.3, radius * 0.15, radius * 0.2, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fill();
      
      // 外发光
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59,130,246,0.1)';
      ctx.fill();
    };
    
    // 绘制节点和连线
    const drawNetwork = (ctx, cx, cy, radius, rot) => {
      const nodes = languages.map(lang => ({
        ...lang,
        angle: Math.atan2(lang.y - 0.5, lang.x - 0.5),
        rad: Math.sqrt(Math.pow(lang.x - 0.5, 2) + Math.pow(lang.y - 0.5, 2)) * radius * 0.8,
        x: cx + (lang.x - 0.5) * radius * 1.2,
        y: cy + (lang.y - 0.5) * radius * 1.2,
      }));
      
      // 绘制连线
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius * 1.5) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(100, 100, 255, ${0.3 * (1 - dist / (radius * 1.5))})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      
      // 绘制节点
      nodes.forEach((node, i) => {
        // 光晕
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}20`;
        ctx.fill();
        
        // 节点圆
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        
        // 内圆
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // 国旗 emoji（简化，用文字代替）
        ctx.font = `${radius * 0.045}px "Apple Color Emoji", "Segoe UI Emoji"`;
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.flag, node.x, node.y);
        
        // 标签
        ctx.font = `${radius * 0.03}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#666';
        ctx.fillText(node.name, node.x, node.y + radius * 0.08);
      });
    };
    
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = canvas.width * 0.3;
      
      rotation += 0.003;
      
      drawEarth(ctx, cx, cy, radius, rotation);
      drawNetwork(ctx, cx, cy, radius, rotation);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setSize);
    };
  }, []);
  
  // 模拟加载进度
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  // 跳转逻辑
  useEffect(() => {
    if (!isLoadingAuth && !loading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigate('/home', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoadingAuth, isAuthenticated, loading, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center p-4">
      {/* 地球画布 */}
      <div className="relative w-80 h-80 md:w-96 md:h-96 mb-8">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* 装饰粒子 */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-3xl">L</span>
        </div>
        <h1 className="text-3xl font-bold text-white">LinguMate</h1>
        <p className="text-white/60 text-sm mt-1">Master Any Language with AI</p>
      </motion.div>
      
      {/* 加载进度条 */}
      <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* 加载文字 */}
      <p className="text-white/50 text-sm">
        {loading ? 'Loading...' : 'Welcome!'}
      </p>
      
      {/* 底部文字 */}
      <p className="absolute bottom-8 text-white/30 text-xs text-center">
        AI-Powered Language Learning
      </p>
    </div>
  );
}