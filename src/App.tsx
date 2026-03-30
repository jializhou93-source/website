/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Palette, 
  ExternalLink, 
  X, 
  Upload, 
  ChevronRight,
  Mail,
  Phone,
  Linkedin,
  Github,
  Monitor,
  Database,
  Camera,
  Layers,
  User,
  Box,
  Cpu,
  Play,
  Plus,
  Trash2,
  ZoomIn,
  LogIn,
  LogOut
} from 'lucide-react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We throw a generic message to the UI but log the details
  throw new Error(error instanceof Error ? error.message : 'Permission denied');
}
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from './firebase';

// --- Types ---
interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string[];
  details: string;
  media?: MediaItem[];
}

interface Project {
  id: string;
  title: string;
  period: string;
  description: string;
  tags: string[];
  media: MediaItem[];
  challenge: string;
  solution: string;
  metrics: string;
}

// --- Data ---
const EXPERIENCES: Experience[] = [
  {
    id: 'exp-1',
    company: 'Nanjing Yuesheng Tech Co., Ltd.',
    role: 'Promotion and Logistics Teacher',
    period: 'Jul 2025 - Present',
    description: [
      'Adjust strategies by period, achieved $18,666 in revenue with team in 3-4 months.',
      'Handled class preparation, document printing, course notifications, student Q&A.'
    ],
    details: 'Focused on educational promotion and logistics management, driving significant revenue growth through strategic campus lectures and live streams.',
    media: [{ url: 'https://picsum.photos/seed/exp1/1200/800', type: 'image' }]
  },
  {
    id: 'exp-2',
    company: 'Nanjing Shanying Info Tech Co., Ltd.',
    role: 'Cross-border E-commerce Intern',
    period: 'Jul 2025 - Nov 2025',
    description: [
      'Managed full-cycle Shopify product operations, including listing, imaging and detail page creation.',
      'Performed SEO & email marketing, operated TikTok and launched overseas live streams for US/UK markets.',
      'Analyzed data with tools like Namecheap, Google Trends and SimilarWeb.'
    ],
    details: 'Deep dive into global e-commerce operations, mastering Shopify, SEO, and social media marketing for international markets.',
    media: [{ url: 'https://picsum.photos/seed/exp3/1200/800', type: 'image' }]
  },
  {
    id: 'exp-3',
    company: 'Nanjing Linhao Medical Devices Co., Ltd.',
    role: 'Financial Assistant',
    period: 'Feb 2025 - Jun 2025',
    description: [
      'Assisted in financial audit, reconciled bank statements, accounts receivable and sales data.',
      'Calculated costs, taxes and logistics fees for medical products.',
      'Prepared monthly profit statements and recognized by the manager.'
    ],
    details: 'Managed complex financial data for medical device distribution, ensuring accuracy in auditing and cost calculation.'
  },
  {
    id: 'exp-4',
    company: 'Shanghai Di\'er Education Tech Co., Ltd.',
    role: 'Marketing Head & CPA Tutor',
    period: 'Jun 2024 - Nov 2024',
    description: [
      'Built 50+ student groups, recruited 15 students from accumulated network.',
      'Delivered 20+ CPA tutoring sessions, organized offline courses, led campus lectures.'
    ],
    details: 'Leadership role combining marketing strategy with academic tutoring, successfully building a strong student community.'
  },
  {
    id: 'exp-5',
    company: 'China Telecom Co., Ltd. Nanjing Branch',
    role: 'Marketing Assistant',
    period: 'Jul 2024 - Oct 2024',
    description: [
      'Managed media promotion with one video reaching 140K+ views.',
      'Operated a 70 freshmen private community alone.',
      'Led offline promotion and presentations, achieved 40+ sales.'
    ],
    details: 'High-impact marketing role focusing on social media reach and community management for a major telecom provider.'
  }
];

const PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Amazon Store Operation',
    period: 'Oct 2025 - Feb 2026',
    description: 'Established an Amazon North America store from scratch, completed certifications like business license, Visa, WorldFirst in Oct 2025 and launched in Nov 2025. Conducted product & patent research via WIPO, USPTO, built supply chain with 1688 suppliers and ZTO International Logistics. Sold the store in Feb 2026 for loss control, achieving $115.76 net revenue after deducting costs of procurement, logistics and Amazon monthly fees and plus $62.02 logistics compensation.',
    tags: ['E-commerce', 'Supply Chain', 'Market Research'],
    media: [
      { url: 'https://picsum.photos/seed/amazon1/1200/800', type: 'image' }
    ],
    challenge: 'Building a complete supply chain and navigating complex Amazon certifications while managing logistics costs.',
    solution: 'Conducted extensive product & patent research via WIPO/USPTO, built a robust supply chain with 1688 suppliers and ZTO International Logistics.',
    metrics: 'Achieved $115.76 net revenue after deducting all costs and fees, plus $62.02 logistics compensation.'
  },
  {
    id: 'proj-2',
    title: 'Foreign Trade Practice',
    period: '2025',
    description: 'Participated in foreign trade practice at Nanjing Kaixin Biotechnology Co., Ltd. Refined development letters, handled B2B & B2C business including B2C promotion of hyperbaric oxygen chambers and B2B factory advantage introduction. Followed up leads from Google and social media advertising via WhatsApp, Facebook, Instagram, TikTok and LinkedIn, then withdrew to focus on Amazon-related operations.',
    tags: ['B2B', 'B2C', 'Global Trade'],
    media: [
      { url: 'https://picsum.photos/seed/trade1/1200/800', type: 'image' }
    ],
    challenge: 'Expanding market reach for specialized medical equipment in a competitive global B2B landscape.',
    solution: 'Refined development letters, managed social media advertising via WhatsApp, Facebook, Instagram, TikTok and LinkedIn.',
    metrics: 'Successfully followed up leads from multiple global platforms, establishing a strong digital presence for the brand.'
  }
];

const SKILLS = [
  { name: 'Data Analysis', icon: <Database className="w-4 h-4" />, tools: ['Power Query', 'Power Pivot', 'Power Map'] },
  { name: 'Visual Design', icon: <Palette className="w-4 h-4" />, tools: ['Photoshop', 'Illustrator', 'Canva'] },
  { name: 'Video Editing', icon: <Camera className="w-4 h-4" />, tools: ['Capcut', 'Premiere'] },
  { name: '3D Visualization', icon: <Layers className="w-4 h-4" />, tools: ['3D Modeling', 'Rendering'] },
  { name: 'Office Suite', icon: <Monitor className="w-4 h-4" />, tools: ['Word Formatting', 'PPT Polishing'] }
];

// --- Components ---

const DonutCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const particlesRef = useRef<any[]>([]);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0.1]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      const particles = [];
      const R = 200; // Major radius
      const r = 80;  // Minor radius
      const count = 3000;

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        
        // Torus parametric equations
        const x = (R + r * Math.cos(theta)) * Math.cos(phi);
        const y = (R + r * Math.cos(theta)) * Math.sin(phi);
        const z = r * Math.sin(theta);

        particles.push({
          x, y, z,
          ox: x, oy: y, oz: z, // Original positions
          vx: 0, vy: 0, vz: 0,
          size: Math.random() * 1.5 + 0.5
        });
      }
      particlesRef.current = particles;
    };

    const rotate = (p: any, angleX: number, angleY: number) => {
      // Y rotation
      let x = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
      let z = p.x * Math.sin(angleY) + p.z * Math.cos(angleY);
      p.x = x;
      p.z = z;

      // X rotation
      let y = p.y * Math.cos(angleX) - p.z * Math.sin(angleX);
      z = p.y * Math.sin(angleX) + p.z * Math.cos(angleX);
      p.y = y;
      p.z = z;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const angle = 0.005;

      particles.forEach(p => {
        rotate(p, angle, angle * 0.5);

        // Interaction
        if (mouseRef.current.active) {
          const dx = p.x + width / 2 - mouseRef.current.x;
          const dy = p.y + height / 2 - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.vx += dx * force * 0.05;
            p.vy += dy * force * 0.05;
          }
        }

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.9;
        p.vy *= 0.9;

        // Elastic return
        // (This is simplified as we rotate the original positions too for consistency)
        // For a true elastic return in 3D while rotating, we'd need more complex math.
        // Here we just let them drift slightly.

        // Projection
        const perspective = 600 / (600 + p.z);
        const px = p.x * perspective + width / 2;
        const py = p.y * perspective + height / 2;

        const alpha = Math.max(0.1, perspective - 0.5);
        ctx.fillStyle = `rgba(218, 32, 90, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size * perspective, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  return (
    <motion.canvas
      ref={canvasRef}
      style={{ opacity }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 z-0 pointer-events-auto"
    />
  );
};

const NeonCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    const animate = () => {
      setTrail(prev => ({
        x: prev.x + (pos.x - prev.x) * 0.15,
        y: prev.y + (pos.y - prev.y) * 0.15
      }));
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [pos]);

  return (
    <>
      <div 
        className="fixed w-4 h-4 bg-magenta rounded-full pointer-events-none z-[9999] mix-blend-screen hidden md:block"
        style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
      />
      <div 
        className="fixed w-12 h-12 border border-magenta/30 rounded-full pointer-events-none z-[9998] mix-blend-screen blur-sm hidden md:block"
        style={{ left: trail.x, top: trail.y, transform: 'translate(-50%, -50%)' }}
      />
    </>
  );
};

const MagneticButton = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    setPos({ x: x * 0.4, y: y * 0.4 });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative group px-6 py-3 rounded-full glass glass-glow transition-all duration-300 hover:border-magenta/50 ${className}`}
      onClick={onClick}
    >
      <span className="relative z-10 flex items-center gap-2 font-mono text-sm uppercase tracking-widest">
        {children}
      </span>
      <div className="absolute inset-0 bg-magenta/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
    </motion.button>
  );
};

const ProjectCard = ({ project, onDetails, onMedia }: { project: Project, onDetails: () => void, onMedia: () => void, key?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onDetails}
      className="spotlight-card glass glass-glow p-6 rounded-2xl cursor-pointer transition-all duration-500 group"
      style={{ boxShadow: `0 0 20px -10px #DA205A` }}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-mono text-magenta/80">{project.period}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onMedia(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan/10 text-cyan/60 hover:text-cyan transition-all group/btn border border-white/5 hover:border-cyan/20"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">View Mission Media</span>
          </button>
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-magenta transition-colors">{project.title}</h3>
        <p className="text-sm text-white/60 mb-4 line-clamp-3 leading-relaxed">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded-full bg-white/5 border border-white/10 uppercase tracking-tighter">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Modal = ({ project, onClose }: { project: Project | null, onClose: () => void }) => {
  if (!project) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[1000] bg-cyber-black overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto px-6 py-20">
        <button 
          onClick={onClose}
          className="fixed top-8 right-8 p-3 glass rounded-full hover:bg-magenta/20 transition-colors z-[1001]"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-magenta font-mono text-sm uppercase tracking-widest mb-4 block">{project.period}</span>
          <h2 className="text-5xl md:text-7xl font-extrabold mb-12">{project.title}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            <div className="glass p-8 rounded-3xl">
              <h4 className="text-magenta font-mono text-xs uppercase mb-4">The Challenge</h4>
              <p className="text-white/70 leading-relaxed">{project.challenge}</p>
            </div>
            <div className="glass p-8 rounded-3xl">
              <h4 className="text-magenta font-mono text-xs uppercase mb-4">The Solution</h4>
              <p className="text-white/70 leading-relaxed">{project.solution}</p>
            </div>
            <div className="glass p-8 rounded-3xl">
              <h4 className="text-magenta font-mono text-xs uppercase mb-4">Key Metrics</h4>
              <p className="text-white/70 leading-relaxed">{project.metrics}</p>
            </div>
          </div>

          <div className="space-y-12">
            {project.media.map((item, i) => (
              <div key={i} className="rounded-3xl overflow-hidden glass p-2">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={`${project.title} screenshot ${i + 1}`} 
                    className="w-full h-auto rounded-2xl grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <video 
                    src={item.url} 
                    controls 
                    className="w-full h-auto rounded-2xl"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- Space Background Component ---
const SpaceBackground = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  
  // Generate static stars data to avoid re-renders
  const stars = useMemo(() => Array.from({ length: 150 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 3 + 2,
  })), []);

  const shootingStars = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 50}%`,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 2 + 3,
    delay: Math.random() * 10,
  })), []);

  return (
    <motion.div 
      style={{ opacity }}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 bg-cyber-black" />
      
      {/* Nebula Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-magenta/5 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />

      <div className="stars-container">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--duration': `${star.duration}s`,
              backgroundColor: star.id % 10 === 0 ? '#DA205A' : star.id % 7 === 0 ? '#00FFFF' : 'white',
              boxShadow: star.size > 2 ? `0 0 ${star.size * 2}px currentColor` : 'none',
            } as any}
          />
        ))}
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="shooting-star"
            style={{
              top: star.top,
              left: star.left,
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`,
              background: `linear-gradient(90deg, ${star.id % 2 === 0 ? '#DA205A' : '#00FFFF'}, transparent)`,
            } as any}
          />
        ))}
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{
    id: string;
    title: string;
    subtitle: string;
    details: string;
    media?: MediaItem[];
  } | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [profileMedia, setProfileMedia] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Profile Media
  useEffect(() => {
    const path = 'sections/profile';
    const unsubscribe = onSnapshot(doc(db, 'sections', 'profile'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.media && data.media.length > 0) {
          setProfileMedia(data.media[0]);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, []);

  // Connection Test
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || user.email !== 'jializhou93@gmail.com') {
      alert('Only the owner can upload media.');
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      try {
        const base64 = await fileToBase64(file);
        const mediaItem = { url: base64, type };
        await setDoc(doc(db, 'sections', 'profile'), {
          media: [mediaItem],
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'sections/profile');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen">
      <SpaceBackground />
      <DonutCanvas />
      <NeonCursor />

      {/* Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[20vh] bg-magenta/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[20vh] bg-magenta/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Whimsical Hero Curve */}
        <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M 320 120 Q 700 50, 850 250 T 400 500 T 250 800 Q 350 950, 700 920"
              stroke="url(#heroGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="drop-shadow-[0_0_15px_rgba(255,0,255,0.6)]"
            />
            <defs>
              <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF00FF" stopOpacity="0" />
                <stop offset="20%" stopColor="#FF00FF" />
                <stop offset="80%" stopColor="#FF00FF" />
                <stop offset="100%" stopColor="#FF00FF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center relative z-10"
        >
          {/* Navigation Bar */}
          <nav className="flex items-center gap-8 md:gap-16 mb-16 pointer-events-auto">
            {[
              { id: 'about', label: 'ABOUT', icon: <User className="w-6 h-6" /> },
              { id: 'work', label: 'WORK', icon: <Briefcase className="w-6 h-6" /> },
              { id: 'projects', label: 'PROJECTS', icon: <Box className="w-6 h-6" /> },
              { id: 'campus', label: 'CAMPUS', icon: <GraduationCap className="w-6 h-6" /> },
              { id: 'skills', label: 'SKILLS', icon: <Cpu className="w-6 h-6" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex flex-col items-center gap-3 transition-all duration-300 hover:scale-110"
              >
                <div className="text-white/40 group-hover:text-magenta transition-colors">
                  {item.icon}
                </div>
                <span className="font-mono text-[10px] tracking-[0.2em] text-white/30 group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <h1 className="text-6xl md:text-9xl font-extrabold tracking-tighter mb-6 pointer-events-none">
            WEBSITE FOR <span className="text-magenta">CARRIE</span>
          </h1>
          <div className="inline-block pointer-events-none mb-8">
            <p className="typewriter font-mono text-lg md:text-2xl text-white/50">
              JiaLi Zhou | Carrie | Job Intention: Intern
            </p>
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-4">
            {isAuthReady && (
              user ? (
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Logged in as {user.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 transition-all border border-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-mono text-[10px] uppercase tracking-widest">Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-magenta/10 hover:bg-magenta/20 text-magenta transition-all border border-magenta/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Owner Login</span>
                </button>
              )
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-magenta to-transparent" />
        </motion.div>
      </section>

      {/* Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-40 space-y-40">
        
        {/* About Me Section */}
        <section id="about" className="scroll-mt-20 relative min-h-screen flex flex-col justify-center py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-16 items-center relative z-10">
            {/* Left Column: Mission ID Frame */}
            <div className="relative group">
              {/* Outer Glow Frame */}
              <div className="absolute -inset-4 bg-magenta/5 blur-2xl rounded-[40px] opacity-50" />
              
              {/* The Frame */}
              <div className="relative glass border-white/10 p-6 rounded-[32px] overflow-hidden aspect-[3/4] flex flex-col items-center justify-center">
                {/* Corner Brackets */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-magenta/50 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-magenta/50 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan/50 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan/50 rounded-br-lg" />
                
                {/* Inner Brackets (Teal) */}
                <div className="absolute top-12 right-12 w-6 h-6 border-t-2 border-r-2 border-cyan/40" />
                <div className="absolute bottom-12 left-12 w-6 h-6 border-b-2 border-l-2 border-cyan/40" />

                {/* Image Container */}
                <div 
                  className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer bg-white/5 group"
                  onClick={() => {
                    if (!user) {
                      handleLogin();
                    } else if (user.email === 'jializhou93@gmail.com') {
                      fileInputRef.current?.click();
                    } else {
                      alert('Only the owner can upload media.');
                    }
                  }}
                >
                  {profileMedia ? (
                    <>
                      {profileMedia.type === 'image' ? (
                        <img 
                          src={profileMedia.url} 
                          alt="Profile" 
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <video 
                          src={profileMedia.url} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                      )}
                      {user?.email === 'jializhou93@gmail.com' && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <Upload className="w-8 h-8 text-white" />
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              await setDoc(doc(db, 'sections', 'profile'), {
                                media: [],
                                updatedAt: serverTimestamp()
                              });
                            }}
                            className="p-3 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/40 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/20 group-hover:text-magenta transition-colors">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-magenta" />
                      ) : (
                        <>
                          <Camera className="w-16 h-16" />
                          <span className="font-mono text-xs uppercase tracking-[0.3em]">Upload Identity</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={handleMediaUpload} 
                />
              </div>
              
              {/* Decorative Outer Brackets */}
              <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-magenta/30 rounded-tr-2xl" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-cyan/30 rounded-bl-2xl" />
            </div>

            {/* Right Column: Content */}
            <div className="space-y-10">
              <div className="space-y-2">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-8xl font-serif italic text-magenta drop-shadow-[0_0_15px_rgba(255,0,255,0.4)] tracking-tighter"
                >
                  CARRIE
                </motion.h2>
                <p className="font-mono text-cyan text-lg tracking-[0.2em] uppercase flex items-center gap-3">
                  Carrie (JiaLi Zhou) <span className="text-white/20">//</span> Intern
                </p>
              </div>

              {/* Mission Briefing Card */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="glass border-white/5 bg-black/40 p-12 rounded-[40px] space-y-10 relative overflow-hidden group"
              >
                <div className="flex items-center gap-4 text-magenta">
                  <GraduationCap className="w-7 h-7" />
                  <h3 className="font-mono text-base uppercase tracking-[0.4em] font-bold">Mission Briefing</h3>
                </div>

                <div className="space-y-8">
                  <p className="font-mono text-xl text-white/80 leading-relaxed">
                    I am a highly motivated student majoring in <span className="text-white font-bold">English</span> at <span className="text-white font-bold">Nanjing Tech University</span>. With a well-rounded profile, my expertise spans across <span className="text-magenta">Marketing</span>, <span className="text-cyan">E-commerce</span>, and <span className="text-purple-400">Financial Analysis</span>. I am bold in trying new things and committed to all-round development, while being an active and cooperative team player. When confronted with challenges, I never avoid problems but stay calm to analyze them, break them down into manageable parts, and solve them systematically. I sincerely hope you can give me an opportunity to enter your team and apply my strengths, keep learning and create real value.
                  </p>
                  
                  <div className="pt-8 border-t border-white/5 flex justify-between items-center font-mono text-sm tracking-widest text-white/40">
                    <div className="flex items-center gap-2">
                      <span>GPA:</span>
                      <span className="text-white">3.6/4</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>L2:</span>
                      <span className="text-white uppercase">German</span>
                    </div>
                  </div>
                </div>

                {/* Decorative Grid Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
              </motion.div>

              {/* Contact Buttons */}
              <div className="flex flex-wrap gap-6">
                <a 
                  href="mailto:15305146265@163.com"
                  className="flex items-center gap-4 px-8 py-4 bg-black/40 border border-white/10 rounded-full hover:border-magenta/50 hover:bg-magenta/5 transition-all group"
                >
                  <Mail className="w-5 h-5 text-magenta group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-xs uppercase tracking-widest text-white/70 group-hover:text-white">Contact</span>
                </a>
                <a 
                  href="tel:+8615305146265"
                  className="flex items-center gap-4 px-8 py-4 bg-black/40 border border-white/10 rounded-full hover:border-cyan/50 hover:bg-cyan/5 transition-all group"
                >
                  <Phone className="w-5 h-5 text-cyan group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-xs uppercase tracking-widest text-white/70 group-hover:text-white">+86 15305146265</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About Section (Old placeholder, now replaced by About Me) */}
        <section className="grid grid-cols-1 gap-20">
          {/* Right: Experience Timeline */}
          <div id="work" className="space-y-12 scroll-mt-20">
            <div className="flex items-center gap-4 mb-8">
              <Briefcase className="w-6 h-6 text-magenta" />
              <h2 className="text-4xl font-bold uppercase tracking-tighter">Working Experience</h2>
            </div>

            <div className="relative space-y-12 pl-8 border-l border-white/10">
              {EXPERIENCES.map((exp, i) => (
                <motion.div 
                  key={exp.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-cyber-black border-2 border-magenta group-hover:scale-125 transition-transform" />
                  <div className="glass glass-glow p-8 rounded-3xl transition-all duration-300 hover:translate-x-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-1">
                          <h3 className="text-2xl font-bold text-white group-hover:text-magenta transition-colors">{exp.company}</h3>
                          <button 
                            onClick={() => setSelectedMedia({
                              id: exp.id,
                              title: exp.company,
                              subtitle: `${exp.role} // ${exp.period}`,
                              details: exp.details,
                              media: exp.media
                            })}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan/10 text-cyan/60 hover:text-cyan transition-all group/btn border border-white/5 hover:border-cyan/20"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">View Mission Media</span>
                          </button>
                        </div>
                        <p className="text-magenta font-mono text-sm">{exp.role}</p>
                      </div>
                      <span className="text-xs font-mono text-white/30 bg-white/5 px-3 py-1 rounded-full">{exp.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {exp.description.map((item, j) => (
                        <li key={j} className="flex gap-3 text-sm text-white/60 leading-relaxed">
                          <ChevronRight className="w-4 h-4 text-magenta shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs italic text-white/30 border-t border-white/5 pt-4">{exp.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Work Section */}
        <section id="projects" className="space-y-12 scroll-mt-20">
          <div className="flex items-center gap-4">
            <Code className="w-6 h-6 text-magenta" />
            <h2 className="text-4xl font-bold uppercase tracking-tighter">Project Experience</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PROJECTS.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onDetails={() => setSelectedProject(project)} 
                onMedia={() => setSelectedMedia({
                  id: project.id,
                  title: project.title,
                  subtitle: `Project Mission // ${project.period}`,
                  details: project.description,
                  media: project.media
                })}
              />
            ))}
          </div>
        </section>

        {/* Campus & Awards Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div id="campus" className="glass p-10 rounded-3xl space-y-8 scroll-mt-20">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <GraduationCap className="w-6 h-6 text-magenta" />
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Campus & Volunteer</h2>
              </div>
              <button 
                onClick={() => setSelectedMedia({
                  id: 'campus',
                  title: 'Campus & Volunteer',
                  subtitle: 'Activity Records // 2024-2026',
                  details: 'Assistant to Counselor, organized campus events, drafted articles. Volunteered for 2024 FIE Women\'s Epee World Cup & 2025 WYSS. Reporter for National Style Beauty Youth program at Nanjing Poly Theater.',
                  media: []
                })}
                className="p-2 rounded-full bg-white/5 hover:bg-magenta/20 text-white/40 hover:text-magenta transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-6 text-sm text-white/60">
              <div className="flex gap-4">
                <div className="w-1 h-auto bg-magenta/30 rounded-full" />
                <p>Assistant to Counselor, organized campus events, drafted articles.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-1 h-auto bg-magenta/30 rounded-full" />
                <p>Volunteered for 2024 FIE Women\'s Epee World Cup & 2025 WYSS.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-1 h-auto bg-magenta/30 rounded-full" />
                <p>Reporter for National Style Beauty Youth program at Nanjing Poly Theater.</p>
              </div>
            </div>
          </div>

          <div id="skills" className="glass p-10 rounded-3xl space-y-8 scroll-mt-20">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Award className="w-6 h-6 text-magenta" />
                <h2 className="text-2xl font-bold uppercase tracking-tighter">Awards & Certs</h2>
              </div>
              <button 
                onClick={() => setSelectedMedia({
                  id: 'awards',
                  title: 'Awards & Certs',
                  subtitle: 'Credentials // 2024-2026',
                  details: 'Social Work Scholarship, Academic Third-Class (2x), CET-4 (601), CET-6 (490), TEM-4, German (2nd), Accounting Qualification, CPA (In Progress), NCRE Level 2, 3D Visualization Cert.',
                  media: []
                })}
                className="p-2 rounded-full bg-white/5 hover:bg-magenta/20 text-white/40 hover:text-magenta transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] uppercase text-magenta">Scholarships</h4>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>Social Work Scholarship</li>
                  <li>Academic Third-Class (2x)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] uppercase text-magenta">Languages</h4>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>CET-4 (601) | CET-6 (490)</li>
                  <li>TEM-4 | German (2nd)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] uppercase text-magenta">Professional</h4>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>Accounting Qualification</li>
                  <li>CPA (In Progress)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-mono text-[10px] uppercase text-magenta">Technical</h4>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>NCRE Level 2</li>
                  <li>3D Visualization Cert</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-20 border-t border-white/5 text-center">
          <MagneticButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to Top
          </MagneticButton>
          <p className="mt-12 font-mono text-[10px] text-white/20 uppercase tracking-[0.5em]">
            &copy; 2026 Carrie Portfolio | Built with Native Canvas & React
          </p>
        </footer>
      </main>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <Modal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>

      {/* Media Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <MediaModal 
            id={selectedMedia.id}
            title={selectedMedia.title}
            subtitle={selectedMedia.subtitle}
            details={selectedMedia.details}
            initialMedia={selectedMedia.media}
            onClose={() => setSelectedMedia(null)}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/// --- Media Modal ---
const MediaModal = ({ 
  id,
  title, 
  subtitle, 
  details, 
  initialMedia, 
  onClose,
  user
}: { 
  id: string;
  title: string; 
  subtitle: string; 
  details: string; 
  initialMedia?: MediaItem[]; 
  onClose: () => void;
  user: FirebaseUser | null;
}) => {
  const [mediaList, setMediaList] = useState<(MediaItem | null)[]>(initialMedia || [null]);
  const [viewingMedia, setViewingMedia] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync with Firestore
  useEffect(() => {
    const path = `sections/${id}`;
    const unsubscribe = onSnapshot(doc(db, 'sections', id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.media) {
          setMediaList([...data.media, null]);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, [id]);
  
  const handleUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || user.email !== 'jializhou93@gmail.com') {
      alert('Only the owner can upload media.');
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = reader.result as string;
          const mediaItem = { url: base64, type };
          
          const docRef = doc(db, 'sections', id);
          try {
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const currentMedia = docSnap.data().media || [];
              if (index < currentMedia.length) {
                // Replace existing
                const newMedia = [...currentMedia];
                newMedia[index] = mediaItem;
                await updateDoc(docRef, {
                  media: newMedia,
                  updatedAt: serverTimestamp()
                });
              } else {
                // Append new
                await updateDoc(docRef, {
                  media: arrayUnion(mediaItem),
                  updatedAt: serverTimestamp()
                });
              }
            } else {
              await setDoc(docRef, {
                media: [mediaItem],
                updatedAt: serverTimestamp()
              });
            }
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `sections/${id}`);
          } finally {
            setIsUploading(false);
          }
        };
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `sections/${id}`);
        setIsUploading(false);
      }
    }
  };

  const addSlot = () => {
    // Just a visual slot, actual persistence happens on upload
    setMediaList([...mediaList, null]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-cyber-black/95 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto glass border-white/10 rounded-[40px] p-8 md:p-16 shadow-2xl no-scrollbar"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-magenta/20 text-white/40 hover:text-magenta transition-all z-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif italic text-magenta drop-shadow-[0_0_15px_rgba(255,0,255,0.3)] mb-4"
          >
            {title}
          </motion.h2>
          <p className="text-cyan font-mono text-sm uppercase tracking-[0.3em]">{subtitle}</p>
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {mediaList.map((item, i) => (
            <motion.div 
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="break-inside-avoid relative group"
            >
              <div className="glass border-white/10 p-3 rounded-2xl overflow-hidden bg-black/40 hover:border-magenta/30 transition-all duration-500 shadow-xl">
                <div 
                  className="relative rounded-xl overflow-hidden cursor-pointer aspect-auto min-h-[150px] bg-white/5 flex items-center justify-center"
                  onClick={() => item ? setViewingMedia(item) : document.getElementById(`media-upload-${i}`)?.click()}
                >
                  {item ? (
                    <>
                      {item.type === 'image' ? (
                        <img src={item.url} alt="Mission Media" className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <video src={item.url} autoPlay loop muted playsInline className="w-full h-auto object-contain" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingMedia(item); }}
                          className="p-3 rounded-full bg-white/10 hover:bg-magenta/20 text-white hover:text-magenta transition-all"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                        {user?.email === 'jializhou93@gmail.com' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); document.getElementById(`media-upload-${i}`)?.click(); }}
                            className="p-3 rounded-full bg-white/10 hover:bg-cyan/20 text-white hover:text-cyan transition-all"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-white/10 group-hover:text-magenta transition-colors">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-magenta" />
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <Camera className="w-8 h-8" />
                            <Play className="w-8 h-8" />
                          </div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Upload Media</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="mt-4 flex justify-between items-center px-2">
                  <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">Media_{i+1}</span>
                  {user?.email === 'jializhou93@gmail.com' && (
                    <button 
                      onClick={async (e) => { 
                        e.stopPropagation();
                        if (item) {
                          const docRef = doc(db, 'sections', id);
                          const docSnap = await getDoc(docRef);
                          if (docSnap.exists()) {
                            const currentMedia = docSnap.data().media || [];
                            const newMedia = currentMedia.filter((_: any, idx: number) => idx !== i);
                            await updateDoc(docRef, { media: newMedia });
                          }
                        } else {
                          setMediaList(prev => prev.filter((_, idx) => idx !== i));
                        }
                      }}
                      className="p-2 text-white/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <input 
                id={`media-upload-${i}`}
                type="file" 
                className="hidden" 
                accept="image/*,video/*"
                onChange={(e) => handleUpload(i, e)}
              />
            </motion.div>
          ))}

          {/* Add Slot Button - Only for owner */}
          {user?.email === 'jializhou93@gmail.com' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addSlot}
              className="w-full break-inside-avoid glass border-dashed border-2 border-white/10 p-12 rounded-2xl flex flex-col items-center justify-center gap-4 text-white/20 hover:border-magenta/50 hover:text-magenta transition-all group"
            >
              <Plus className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
              <span className="font-mono text-xs uppercase tracking-[0.3em]">Add New Slot</span>
            </motion.button>
          )}
        </div>

        <div className="mt-20 pt-12 border-t border-white/5">
          <div className="flex items-center gap-4 mb-6 text-magenta/50">
            <div className="w-12 h-px bg-magenta/20" />
            <span className="font-mono text-[10px] uppercase tracking-[0.5em]">Mission Details</span>
          </div>
          <p className="text-xl text-white/60 leading-relaxed font-serif italic text-center max-w-3xl mx-auto">
            "{details}"
          </p>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {viewingMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setViewingMedia(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X className="w-10 h-10" />
            </button>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {viewingMedia.type === 'image' ? (
                <img 
                  src={viewingMedia.url} 
                  alt="Full View" 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                />
              ) : (
                <video 
                  src={viewingMedia.url} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-full shadow-2xl rounded-lg"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
