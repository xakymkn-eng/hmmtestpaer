/**
 * Interactive Mini Universe Galaxy Starmap Modal:
 * Displays a galactic celestial mini-map with 40 scattered universes
 * and a massive Supermassive Black Hole (Hố Đen Siêu To Gargantua) in the dead center.
 * Features:
 * - High-precision mouse wheel zoom, touch pinch-to-zoom, and smooth drag-panning
 * - Spacious 1400x900 virtual galactic coordinate space with large, distinctive planet nodes
 * - Central Supermassive Black Hole with swirling accretion disk, photon ring, and gravitational lensing
 * - 40 scattered universes across 5 celestial clusters with cluster auto-centering and zoom focus
 * - Quick zoom presets: Toàn Cảnh (Overview 0.55x), Chuẩn (1.0x), Cận Cảnh (1.8x), Tâm Hố Đen
 * - Maximize / Fullscreen Map view mode (collapsible dossier panel for 100% starmap viewport)
 * - Milestone modal dialog with Gold + Gems + Shards claim rewards
 * - Direct "XUẤT KÍCH CHIẾN ĐẤU" deploy CTA
 */

import React,{ useState,useMemo,useRef } from 'react';
import {
X,ChevronRight,
ChevronLeft,
Flame,
Swords,
Trophy,
Star,
Skull,
LayoutGrid,
Map as MapIcon,
Compass,Gift,
Check,ZoomIn,
ZoomOut,
Maximize2,
Minimize2,
Search
} from 'lucide-react';
import {
UNIVERSES,UNIVERSE_CLUSTERS,CENTRAL_BLACK_HOLE,
getConquestSummary,
getMilestoneStatuses,
getClusterById,
getClusterCentroid,
clampMapZoom,
calculatePanOffsetForTarget
} from '../game/universe';
import { sound } from '../game/audio';

interface UniverseSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  universeProgress: Record<number, number>;
  claimedMilestoneIds?: number[];
  firstClearedUniverseIds?: number[];
  onDeployUniverse: (universeId: number) => void;
  onClaimMilestone?: (milestoneId: number) => void;
  onBackToModeSelect?: () => void;
}

export const UniverseSelectModal: React.FC<UniverseSelectModalProps> = ({
  isOpen,
  onClose,
  universeProgress,
  claimedMilestoneIds = [],
  firstClearedUniverseIds = [],
  onDeployUniverse,
  onClaimMilestone,
  onBackToModeSelect,
}) => {
  const [selectedUniverseId, setSelectedUniverseId] = useState<number>(0); // 0 is Central Black Hole
  const [viewMode, setViewMode] = useState<'starmap' | 'grid'>('starmap');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unconquered' | 'conquered'>('all');
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpandedMap, setIsExpandedMap] = useState<boolean>(false); // Expand map to full width
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(true); // Mobile bottom panel toggle

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);
  const rafIdRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<any>(null);

  const conquestSummary = getConquestSummary(universeProgress);
  const milestoneStatuses = getMilestoneStatuses(conquestSummary.conqueredCount, claimedMilestoneIds);
  const claimableMilestonesCount = milestoneStatuses.filter((m) => m.isUnlocked && !m.isClaimed).length;

  // Filtered universes
  const filteredUniverses = useMemo(() => {
    return UNIVERSES.filter((u) => {
      if (selectedClusterFilter !== 'all' && u.clusterId !== selectedClusterFilter) {
        return false;
      }
      const progress = universeProgress[u.id] || 0;
      if (statusFilter === 'unconquered' && progress >= 100) return false;
      if (statusFilter === 'conquered' && progress < 100) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(query) ||
          u.code.toLowerCase().includes(query) ||
          u.vietnameseTitle.toLowerCase().includes(query) ||
          u.bossName.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [selectedClusterFilter, statusFilter, universeProgress, searchQuery]);

  const selectedUniverse = UNIVERSES.find((u) => u.id === selectedUniverseId) || CENTRAL_BLACK_HOLE;
  const currentConquest = universeProgress[selectedUniverse.id] || 0;
  const is100PercentConquered = currentConquest >= 100;
  const isFirstCleared = firstClearedUniverseIds.includes(selectedUniverse.id);
  const cluster = getClusterById(selectedUniverse.clusterId);

  const triggerAnimatedPanZoom = (newOffset: { x: number; y: number }, newZoom?: number) => {
    setIsTransitioning(true);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => setIsTransitioning(false), 240);
    setPanOffset(newOffset);
    if (newZoom !== undefined) setZoomLevel(newZoom);
  };

  // Center on selected universe
  const handleSelectUniverse = (id: number, autoCenter: boolean = false) => {
    sound.playClick();
    setSelectedUniverseId(id);
    if (autoCenter) {
      const target = UNIVERSES.find((u) => u.id === id) || CENTRAL_BLACK_HOLE;
      const newOffset = calculatePanOffsetForTarget(target.nodeX, target.nodeY, 1400, 900, zoomLevel);
      triggerAnimatedPanZoom(newOffset);
    }
  };

  // Center on cluster and set zoom
  const handleSelectCluster = (clusterId: number | 'all') => {
    sound.playClick();
    setSelectedClusterFilter(clusterId);
    if (clusterId === 0) {
      setSelectedUniverseId(0);
      triggerAnimatedPanZoom({ x: 0, y: 0 }, 1.2);
    } else if (clusterId === 'all') {
      triggerAnimatedPanZoom({ x: 0, y: 0 }, 0.65);
    } else {
      const centroid = getClusterCentroid(clusterId);
      const clusterUniverses = UNIVERSES.filter((u) => u.clusterId === clusterId);
      if (clusterUniverses.length > 0) {
        setSelectedUniverseId(clusterUniverses[0].id);
      }
      const targetZoom = 1.35;
      const newOffset = calculatePanOffsetForTarget(centroid.x, centroid.y, 1400, 900, targetZoom);
      triggerAnimatedPanZoom(newOffset, targetZoom);
    }
  };

  const handleCycleUniverse = (direction: 'prev' | 'next') => {
    sound.playClick();
    const currIndex = UNIVERSES.findIndex((u) => u.id === selectedUniverseId);
    let nextId: number;
    if (direction === 'prev') {
      const prevIdx = (currIndex - 1 + UNIVERSES.length) % UNIVERSES.length;
      nextId = UNIVERSES[prevIdx].id;
    } else {
      const nextIdx = (currIndex + 1) % UNIVERSES.length;
      nextId = UNIVERSES[nextIdx].id;
    }
    setSelectedUniverseId(nextId);
    const target = UNIVERSES.find((u) => u.id === nextId) || CENTRAL_BLACK_HOLE;
    const newOffset = calculatePanOffsetForTarget(target.nodeX, target.nodeY, 1400, 900, zoomLevel);
    triggerAnimatedPanZoom(newOffset);
  };

  const handleDeploy = () => {
    sound.playClick();
    onDeployUniverse(selectedUniverse.id);
  };

  // Zoom handling with clamp
  const handleZoom = (delta: number) => {
    triggerAnimatedPanZoom(panOffset, clampMapZoom(zoomLevel + delta));
  };

  const handleSetZoomPreset = (zoom: number) => {
    sound.playClick();
    const targetPan = zoom <= 0.65 ? { x: 0, y: 0 } : panOffset;
    triggerAnimatedPanZoom(targetPan, clampMapZoom(zoom));
  };

  const handleCenterBlackHole = () => {
    sound.playClick();
    setSelectedUniverseId(0);
    triggerAnimatedPanZoom({ x: 0, y: 0 }, 1.3);
  };

  // Mouse Wheel Zoom centered on cursor with ZERO transition lag
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setIsTransitioning(false);
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    setZoomLevel((prevZoom) => {
      const newZoom = clampMapZoom(prevZoom * zoomFactor);
      if (newZoom === prevZoom) return prevZoom;

      const rect = mapViewportRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        const ratio = newZoom / prevZoom;
        setPanOffset((prevPan) => ({
          x: Math.max(-1200, Math.min(1200, Math.round(mouseX - (mouseX - prevPan.x) * ratio))),
          y: Math.max(-1200, Math.min(1200, Math.round(mouseY - (mouseY - prevPan.y) * ratio))),
        }));
      }
      return newZoom;
    });
  };

  // Mouse Dragging with RAF throttling
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsTransitioning(false);
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      setPanOffset({
        x: Math.max(-1200, Math.min(1200, clientX - dragStartRef.current.x)),
        y: Math.max(-1200, Math.min(1200, clientY - dragStartRef.current.y)),
      });
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Dragging & Pinch to Zoom with RAF throttling
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsTransitioning(false);
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      };
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        setPanOffset({
          x: Math.max(-1200, Math.min(1200, touchX - dragStartRef.current.x)),
          y: Math.max(-1200, Math.min(1200, touchY - dragStartRef.current.y)),
        });
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchStartDistRef.current;
      const newZoom = clampMapZoom(touchStartZoomRef.current * scale);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        setZoomLevel(newZoom);
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-[1550px] h-[98vh] max-h-[960px] overflow-hidden bg-gradient-to-b from-[#0b172a] via-[#050b14] to-[#03070f] border border-cyan-500/50 rounded-2xl shadow-[0_0_70px_rgba(6,182,212,0.35)] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 border-b border-cyan-500/25 bg-slate-950/95 gap-2 shrink-0 z-20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {onBackToModeSelect && (
              <button
                onClick={onBackToModeSelect}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-orbitron text-cyan-300 hover:text-white transition-colors cursor-pointer"
              >
                ← CHẾ ĐỘ
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Compass className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300">
                  BẢN ĐỒ VŨ TRỤ THIÊN HÀ
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-orbitron font-black text-cyan-300">
                  80 MAP + HỐ ĐEN GARGANTUA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-rajdhani hidden sm:block">
                Cuộn chuột hoặc chụm ngón tay để <strong className="text-cyan-300">Zoom Phóng To / Thu Nhỏ</strong> toàn dải ngân hà
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-orbitron">
              <button
                onClick={() => setViewMode('starmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'starmap'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>BẢN ĐỒ SAO</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>DANH SÁCH ({UNIVERSES.length})</span>
              </button>
            </div>

            {/* Toggle Expand Starmap Viewport */}
            {viewMode === 'starmap' && (
              <button
                onClick={() => setIsExpandedMap((prev) => !prev)}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-orbitron font-bold transition-all cursor-pointer ${
                  isExpandedMap
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title={isExpandedMap ? 'Thu nhỏ bảng thông số' : 'Mở rộng bản đồ toàn màn hình'}
              >
                {isExpandedMap ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span>{isExpandedMap ? 'THU GỌN' : 'MỞ RỘNG BẢN ĐỒ'}</span>
              </button>
            )}

            {/* Milestones Button */}
            <button
              onClick={() => setIsMilestoneModalOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50 hover:border-amber-400 text-xs font-orbitron font-bold text-amber-300 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">CỘT MỐC</span>
              {claimableMilestonesCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black font-orbitron flex items-center justify-center animate-bounce shadow">
                  {claimableMilestonesCount}
                </span>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              aria-label="Đóng bản đồ vũ trụ"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cluster Tabs & Quick Jump Toolbar */}
        <div className="px-3 sm:px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto shrink-0 z-10">
          <div className="flex items-center gap-1.5 text-xs font-orbitron font-bold">
            <button
              onClick={() => handleSelectCluster('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                selectedClusterFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              🌌 TOÀN THIÊN HÀ
            </button>
            <button
              onClick={() => handleSelectCluster(0)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedClusterFilter === 0 || selectedUniverseId === 0
                  ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-black shadow-[0_0_18px_rgba(249,115,22,0.8)] animate-pulse'
                  : 'text-amber-400 hover:text-amber-200 border border-amber-500/40 bg-slate-900/60'
              }`}
            >
              <span className="text-sm">🕳️</span>
              <span>HỐ ĐEN GARGANTUA</span>
            </button>
            {UNIVERSE_CLUSTERS.filter((c) => c.id !== 0).map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCluster(c.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedClusterFilter === c.id
                    ? 'text-white border shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
                style={{
                  borderColor: selectedClusterFilter === c.id ? c.color : 'transparent',
                  backgroundColor: selectedClusterFilter === c.id ? `${c.color}35` : undefined,
                  boxShadow: selectedClusterFilter === c.id ? `0 0 15px ${c.color}40` : undefined,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[150px] max-w-[220px] hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vũ trụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-rajdhani"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Left/Center: Interactive Starmap Viewport */}
          <div
            ref={mapViewportRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
            className="flex-1 relative overflow-hidden bg-[#030712] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          >
            {viewMode === 'starmap' ? (
              <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                {/* Transformable Layer (Hardware Accelerated 60 FPS) */}
                <div
                  style={{
                    transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
                    transformOrigin: 'center center',
                    transition: isTransitioning ? 'transform 0.22s cubic-bezier(0.2, 0, 0, 1)' : 'none',
                    willChange: 'transform',
                  }}
                  className="w-[1400px] h-[900px] relative shrink-0"
                >
                  {/* Space Grid & Orbital Cosmic Rings (Clean, Zero-Cost SVG/Borders) */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="absolute w-[240px] h-[240px] rounded-full border border-orange-500/30" />
                    <div className="absolute w-[450px] h-[450px] rounded-full border border-cyan-500/20 border-dashed" />
                    <div className="absolute w-[720px] h-[720px] rounded-full border border-purple-500/20" />
                    <div className="absolute w-[980px] h-[980px] rounded-full border border-pink-500/15 border-dashed" />
                    <div className="absolute w-[1240px] h-[1240px] rounded-full border border-indigo-500/15" />
                    {/* Galactic Axis Crosshairs */}
                    <div className="absolute w-full h-[1px] bg-slate-800/40" />
                    <div className="absolute h-full w-[1px] bg-slate-800/40" />
                  </div>

                  {/* Constellation link lines connecting scattered universes to neighboring nodes */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <linearGradient id="bhLinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    {/* Constellation lines */}
                    {UNIVERSES.filter((u) => u.id !== 0).map((u) => {
                      if (u.id % 3 === 1) {
                        return (
                          <line
                            key={`bh-line-${u.id}`}
                            x1="50%"
                            y1="50%"
                            x2={`${u.nodeX}%`}
                            y2={`${u.nodeY}%`}
                            stroke="url(#bhLinkGrad)"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                            className="opacity-40"
                          />
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {/* ============================================================== */}
                  {/* CENTRAL SUPERMASSIVE BLACK HOLE (MAP HỐ ĐEN SIÊU TO GARGANTUA) */}
                  {/* ============================================================== */}
                  <div
                    onClick={() => handleSelectUniverse(0, true)}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-30 flex flex-col items-center group cursor-pointer ${
                      selectedUniverseId === 0 ? 'scale-115' : 'hover:scale-105'
                    }`}
                  >
                    {/* Optimized Gravitational Accretion Disk & Vortex (No heavy blur-2xl) */}
                    <div className="relative flex items-center justify-center">
                      {/* Gravitational Halo */}
                      <div
                        className="absolute -inset-10 rounded-full"
                        style={{
                          background: 'radial-gradient(circle, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0.1) 60%, transparent 100%)',
                        }}
                      />

                      {/* Accretion Disk */}
                      <div
                        className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-dashed border-orange-500/80 shadow-[0_0_40px_rgba(249,115,22,0.6)]"
                      />

                      {/* Inner Accretion Plasma Ring */}
                      <div
                        className="absolute w-28 h-28 sm:w-34 sm:h-34 rounded-full border-2 border-yellow-300/80 shadow-[0_0_25px_rgba(253,224,71,0.7)]"
                      />

                      {/* Relativistic Photon Sphere */}
                      <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.8)]" />

                      {/* Event Horizon & Black Hole Singularity Core */}
                      <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950 border-2 border-orange-400 flex items-center justify-center shadow-[inset_0_0_20px_#000000]">
                        <span className="text-2xl sm:text-3xl">🕳️</span>
                      </div>

                      {/* Target Ring when selected */}
                      {selectedUniverseId === 0 && (
                        <div className="absolute -inset-4 rounded-full border-2 border-cyan-400 ring-2 ring-cyan-400/50 pointer-events-none" />
                      )}
                    </div>

                    {/* Massive Black Hole Badge Label */}
                    <div
                      className={`mt-3 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-orbitron font-black tracking-wider whitespace-nowrap shadow-xl border ${
                        selectedUniverseId === 0
                          ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white border-white scale-105 shadow-[0_0_25px_rgba(249,115,22,0.8)]'
                          : 'bg-slate-950/95 text-amber-300 border-amber-500/70 group-hover:border-amber-400'
                      }`}
                    >
                      <span>🕳️ HỐ ĐEN SIÊU ĐẠI · GARGANTUA</span>
                      {universeProgress[0] >= 100 && (
                        <span className="ml-2 text-yellow-300 font-black">👑 100%</span>
                      )}
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* 40 SCATTERED UNIVERSES */}
                  {/* ============================================================== */}
                  {UNIVERSES.filter((u) => u.id !== 0).map((universe) => {
                    const progress = universeProgress[universe.id] || 0;
                    const isConquered = progress >= 100;
                    const isSelected = universe.id === selectedUniverseId;
                    const matchesFilter = filteredUniverses.some((f) => f.id === universe.id);

                    return (
                      <button
                        key={universe.id}
                        onClick={() => handleSelectUniverse(universe.id, true)}
                        style={{
                          left: `${universe.nodeX}%`,
                          top: `${universe.nodeY}%`,
                          transform: 'translate(-50%, -50%)',
                          opacity: matchesFilter ? 1 : 0.25,
                        }}
                        className={`absolute z-10 flex flex-col items-center group cursor-pointer ${
                          isSelected ? 'scale-120 z-20' : 'hover:scale-110'
                        }`}
                        title={`${universe.name} - Chiếm đóng: ${progress}%`}
                      >
                        {/* Celestial Node Sphere */}
                        <div className="relative flex items-center justify-center">
                          {/* Outer node planet circle */}
                          <div
                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 shadow-md ${
                              isSelected
                                ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.8)] ring-4 ring-cyan-400 ring-offset-1 ring-offset-slate-950'
                                : isConquered
                                ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                                : 'border-slate-600 bg-slate-900 group-hover:border-cyan-400'
                            }`}
                            style={{
                              background: isConquered
                                ? 'radial-gradient(circle, #f59e0b 0%, #78350f 100%)'
                                : `radial-gradient(circle, ${universe.themeColor}55 0%, #050b14 90%)`,
                            }}
                          >
                            {isConquered ? (
                              <span className="text-sm">🏆</span>
                            ) : (
                              <span className="font-orbitron font-black text-xs text-white">
                                {universe.id < 10 ? `0${universe.id}` : universe.id}
                              </span>
                            )}
                          </div>

                          {/* 100% conquest crown badge */}
                          {isConquered && (
                            <div className="absolute -top-2.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-orbitron font-black text-[8px] shadow">
                              100%
                            </div>
                          )}

                          {/* Danger stars indicator */}
                          <div className="absolute -bottom-1.5 flex items-center text-[8px] text-amber-400">
                            ★{universe.recommendedStars}
                          </div>
                        </div>

                        {/* Node Label */}
                        <div
                          className={`mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-orbitron font-bold whitespace-nowrap shadow-md border ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 border-white font-black scale-105'
                              : isConquered
                              ? 'bg-amber-950/90 text-yellow-300 border-yellow-500/60'
                              : 'bg-slate-950/90 text-slate-300 border-slate-700 group-hover:text-cyan-300 group-hover:border-cyan-400'
                          }`}
                        >
                          U-{universe.id < 10 ? `0${universe.id}` : universe.id}
                          {!isConquered && progress > 0 && (
                            <span className="ml-1 text-cyan-300 font-extrabold">({progress}%)</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Starmap Navigation HUD Controls: Zoom (+, -, Presets, Reset) */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-20 pointer-events-auto">
                  {/* Zoom controls card */}
                  <div className="p-1.5 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-2xl flex flex-col gap-1.5 backdrop-blur-md">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleZoom(0.25)}
                        className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 flex items-center justify-center cursor-pointer shadow hover:text-white"
                        title="Phóng to bản đồ (hoặc cuộn chuột lên)"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleZoom(-0.25)}
                        className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 flex items-center justify-center cursor-pointer shadow hover:text-white"
                        title="Thu nhỏ bản đồ (hoặc cuộn chuột xuống)"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Zoom Percentage Readout */}
                    <div className="text-center py-0.5 px-1 rounded bg-slate-900/80 text-[10px] font-orbitron font-black text-cyan-300 border border-cyan-500/30">
                      {Math.round(zoomLevel * 100)}%
                    </div>

                    {/* Preset Zoom Levels */}
                    <div className="flex flex-col gap-1 pt-1 border-t border-slate-800 text-[10px] font-orbitron">
                      <button
                        onClick={() => handleSetZoomPreset(0.55)}
                        className={`px-2 py-1 rounded text-center transition-colors cursor-pointer ${
                          zoomLevel <= 0.65
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                        title="Xem toàn cảnh tất cả 41 vũ trụ"
                      >
                        TOÀN CẢNH
                      </button>
                      <button
                        onClick={() => handleSetZoomPreset(1.0)}
                        className={`px-2 py-1 rounded text-center transition-colors cursor-pointer ${
                          Math.abs(zoomLevel - 1.0) < 0.1
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                        title="Tỉ lệ chuẩn 1x"
                      >
                        CHUẨN 1X
                      </button>
                      <button
                        onClick={() => handleSetZoomPreset(1.8)}
                        className={`px-2 py-1 rounded text-center transition-colors cursor-pointer ${
                          zoomLevel >= 1.7
                            ? 'bg-cyan-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-300 hover:text-white'
                        }`}
                        title="Phóng to cận cảnh các hành tinh"
                      >
                        CẬN CẢNH
                      </button>
                    </div>

                    {/* Center Black Hole quick button */}
                    <button
                      onClick={handleCenterBlackHole}
                      className="px-2 py-1 rounded bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 text-[10px] font-orbitron font-black hover:opacity-90 transition-opacity cursor-pointer text-center"
                      title="Định vị Hố Đen Siêu Đại Gargantua"
                    >
                      🕳️ HỐ ĐEN
                    </button>
                  </div>
                </div>

                {/* Radar Inset (Bottom-Left) */}
                <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[9px] font-orbitron text-slate-400 hidden sm:flex items-center gap-2.5 pointer-events-auto backdrop-blur-md shadow-xl">
                  <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-700 relative flex items-center justify-center overflow-hidden">
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping absolute" />
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400 absolute" />
                    <div className="w-full h-[1px] bg-cyan-500/20" />
                    <div className="h-full w-[1px] bg-cyan-500/20" />
                    {/* Viewport rect indicator on radar */}
                    <div
                      className="absolute border border-cyan-400/70 bg-cyan-400/10 rounded-sm pointer-events-none"
                      style={{
                        width: `${Math.max(14, Math.min(48, 36 / zoomLevel))}px`,
                        height: `${Math.max(10, Math.min(48, 24 / zoomLevel))}px`,
                        transform: `translate(${-panOffset.x * 0.02}px, ${-panOffset.y * 0.02}px)`,
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-white font-bold flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>RADAR THIÊN HÀ</span>
                    </div>
                    <div className="text-cyan-300">80 VŨ TRỤ + HỐ ĐEN</div>
                    <div className="text-slate-400 text-[8px] mt-0.5">
                      Kéo thả để dạo quanh vũ trụ
                    </div>
                  </div>
                </div>

                {/* Quick Prev / Next Navigator (Bottom-Right) */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-20 pointer-events-auto">
                  <button
                    onClick={() => handleCycleUniverse('prev')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-xs font-orbitron text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer shadow"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>TRƯỚC</span>
                  </button>
                  <button
                    onClick={() => handleCycleUniverse('next')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-xs font-orbitron text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer shadow"
                  >
                    <span>SAU</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Grid List View of All 41 Universes */
              <div className="w-full h-full p-3 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 overflow-y-auto">
                {filteredUniverses.map((universe) => {
                  const progress = universeProgress[universe.id] || 0;
                  const isConquered = progress >= 100;
                  const isSelected = universe.id === selectedUniverseId;

                  return (
                    <div
                      key={universe.id}
                      onClick={() => handleSelectUniverse(universe.id, true)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-[1.02]'
                          : universe.isBlackHole
                          ? 'bg-orange-950/40 border-orange-500/60 hover:border-orange-400'
                          : isConquered
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded font-orbitron font-black text-[10px] ${
                            universe.isBlackHole
                              ? 'bg-orange-500 text-slate-950'
                              : 'bg-slate-800 text-white'
                          }`}
                        >
                          {universe.code}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400 text-xs">★</span>
                          <span className="text-[10px] font-orbitron text-slate-300">
                            {universe.recommendedStars}
                          </span>
                        </div>
                      </div>

                      <div className="font-orbitron font-bold text-xs text-white mb-0.5 truncate">
                        {universe.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-rajdhani mb-2 truncate">
                        Trùm: <strong className="text-rose-400">{universe.bossName}</strong>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-[10px] font-orbitron">
                        <span className="text-slate-400">Tiến độ:</span>
                        <span className={isConquered ? 'text-amber-300 font-bold' : 'text-cyan-300'}>
                          {progress}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Selected Universe Tactical Dossier & Launch Panel (Collapsible if isExpandedMap is true) */}
          <div
            className={`${
              isExpandedMap ? 'hidden' : 'flex'
            } w-full lg:w-[380px] xl:w-[420px] bg-slate-950/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex-col justify-between p-3.5 sm:p-5 shrink-0 overflow-y-auto max-h-[46vh] lg:max-h-full z-10`}
          >
            <div>
              {/* Universe Header Banner */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`px-2 py-0.5 rounded font-orbitron font-black text-[10px] ${
                        selectedUniverse.isBlackHole
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                      }`}
                    >
                      {selectedUniverse.code}
                    </span>
                    <span className="text-xs font-orbitron text-slate-400">
                      {cluster ? cluster.name : 'Chiến Dịch Vũ Trụ'}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black font-orbitron text-white leading-tight">
                    {selectedUniverse.name}
                  </h3>
                  <div className="text-xs font-rajdhani text-cyan-300 font-semibold">
                    {selectedUniverse.vietnameseTitle}
                  </div>
                </div>

                {is100PercentConquered && (
                  <div className="px-2 py-1 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-orbitron font-bold text-[10px] flex items-center gap-1 shrink-0">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>ĐÃ CHIẾM ĐÓNG</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mb-3">
                {selectedUniverse.description}
              </p>

              {/* Danger & Recommended Ratings */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-orbitron text-slate-400 uppercase">
                    MỨC ĐỘ NGUY HIỂM
                  </div>
                  <div className="text-sm font-orbitron font-black text-rose-400 flex items-center gap-1">
                    <Skull className="w-3.5 h-3.5 text-rose-500" />
                    <span>CẤP {selectedUniverse.dangerRating} / 10</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-orbitron text-slate-400 uppercase">
                    CHIẾN LỰC KHUYẾN NGHỊ
                  </div>
                  <div className="text-sm font-orbitron font-black text-amber-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>
                      ★{selectedUniverse.recommendedStars} ({selectedUniverse.recommendedCombatPower.toLocaleString()} CP)
                    </span>
                  </div>
                </div>
              </div>

              {/* Boss Dossier */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/40 mb-3">
                <div className="text-[10px] font-orbitron text-rose-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" />
                  <span>TRÙM ĐẦU NÃO PHỤ TRÁCH</span>
                </div>
                <div className="font-orbitron font-bold text-sm text-white">
                  {selectedUniverse.bossName}
                </div>
                <div className="text-xs font-rajdhani text-slate-400">
                  {selectedUniverse.bossTitle}
                </div>
              </div>

              {/* Environmental Battlefield Hazard */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/40 mb-3">
                <div className="text-[10px] font-orbitron text-cyan-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                  <span>{selectedUniverse.hazard.icon}</span>
                  <span>{selectedUniverse.hazard.name}</span>
                </div>
                <p className="text-xs font-rajdhani text-slate-300 mb-1">
                  {selectedUniverse.hazard.description}
                </p>
                <div className="text-[11px] font-orbitron font-bold text-emerald-400">
                  {selectedUniverse.hazard.buffSummary}
                </div>
              </div>

              {/* Rewards Preview */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-3 text-xs font-orbitron">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>PHẦN THƯỞNG CHIẾM ĐÓNG</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Vàng chiến dịch:</span>
                  <strong className="text-yellow-300 font-bold">
                    +{selectedUniverse.rewardGold.toLocaleString()} 🪙
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-300 mt-1">
                  <span>Thưởng lần đầu (100%):</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-white font-bold">
                      +{selectedUniverse.firstClearGems.toLocaleString()} 💎
                    </strong>
                    <strong className="text-cyan-300 font-bold">
                      +{selectedUniverse.firstClearShards.count} Mảnh
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Deploy Button */}
            <div className="pt-2">
              <button
                onClick={handleDeploy}
                className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-orbitron font-black text-sm tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95 ${
                  selectedUniverse.isBlackHole
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_25px_rgba(249,115,22,0.6)] animate-pulse'
                    : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                }`}
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>
                  {selectedUniverse.isBlackHole
                    ? '⚔️ XUẤT KÍCH VÀO HỐ ĐEN SIÊU ĐẠI'
                    : `🚀 XUẤT KÍCH CHIẾN ĐẤU (WAVE 1/5)`}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MILESTONES MODAL OVERLAY */}
        {/* ============================================================== */}
        {isMilestoneModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/50 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black font-orbitron text-amber-300">
                      CỘT MỐC CHINH PHỤC ĐA VŨ TRỤ
                    </h3>
                    <p className="text-xs text-slate-400 font-rajdhani">
                      Đã chiếm đóng: <strong className="text-amber-400">{conquestSummary.conqueredCount} / 80</strong> vũ trụ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                {milestoneStatuses.map(({ milestone: m, isUnlocked, isClaimed }) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isClaimed
                        ? 'bg-slate-950/50 border-slate-800 opacity-60'
                        : isUnlocked
                        ? 'bg-amber-950/30 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-orbitron font-bold text-amber-300">
                          MỐC {m.requiredConquered} VŨ TRỤ
                        </span>
                        <span className="text-xs font-orbitron font-bold text-white">
                          {m.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-orbitron text-slate-300">
                        <span className="text-yellow-400">+{m.rewardGold.toLocaleString()} 🪙</span>
                        <span className="text-cyan-300">+{m.rewardGems.toLocaleString()} 💎</span>
                      </div>
                    </div>

                    <div>
                      {isClaimed ? (
                        <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 font-orbitron font-bold text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ĐÃ NHẬN
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => onClaimMilestone && onClaimMilestone(m.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-orbitron font-black text-xs shadow-lg hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>NHẬN THƯỞNG</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-orbitron font-bold text-xs">
                          {conquestSummary.conqueredCount} / {m.requiredConquered}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
