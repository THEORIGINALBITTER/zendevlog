import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const OrbitMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState('main'); // 'main' | 'content'
  const [logoRotation, setLogoRotation] = useState(0);
  const [isLightTheme, setIsLightTheme] = useState(
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light'
  );
  const [viewport, setViewport] = useState(
    typeof window !== 'undefined'
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollY: window.scrollY,
          scrollMax: Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
        }
      : { width: 1440, height: 900, scrollY: 0, scrollMax: 1 }
  );

  const config = {
    radius: 92,
    buttonSize: 45,
    logoText: '禅',
    logoSrc: 'https://denisbitter.de/images/responsive/deni_round-128.webp',
    logoType: 'image',                // 'text' oder 'image'
    menuItemFontSize: 9,
    responsive: {
      desktop: { radius: 74, buttonSize: 50, menuItemFontSize: 8 },
      ipadPortrait: { radius: 74, buttonSize: 45, menuItemFontSize: 9 },
      ipadLandscape: { radius: 74, buttonSize: 45, menuItemFontSize: 9 },
      mobile: { radius: 74, buttonSize: 45, menuItemFontSize: 8 },
      breakpoints: { ipadPortraitMax: 1024, ipadLandscapeMax: 1366, mobileMax: 768 }
    },
    colors: {
      buttonBg: 'transparent',
      buttonOutline: '#AC8E66',
      buttonOutlineWidth: 1,
      menuItemBg: '#1a1a1a',
      menuItemText: '#e8e3d7',
      menuItemOutline: '#AC8E66',
      menuItemOutlineWidth: 1,
    },
    animation: { logoStiffness: 350, logoDamping: 15 }
  };

  useEffect(() => {
    const updateViewport = () => {
      const doc = document.documentElement;
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        scrollY: window.scrollY,
        scrollMax: Math.max(1, doc.scrollHeight - window.innerHeight),
      });
    };

    updateViewport();
    window.addEventListener('scroll', updateViewport, { passive: true });
    window.addEventListener('resize', updateViewport);
    return () => {
      window.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsLightTheme(root.getAttribute('data-theme') === 'light');
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const activeResponsive = useMemo(() => {
    const w = viewport.width;
    const h = viewport.height;
    const b = config.responsive.breakpoints;
    if (w <= b.mobileMax) return config.responsive.mobile;
    if (w <= b.ipadPortraitMax && h > w) return config.responsive.ipadPortrait;
    if (w <= b.ipadLandscapeMax) return config.responsive.ipadLandscape;
    return config.responsive.desktop;
  }, [viewport]);

  const mainItems = [
    { id: '1', angle: -90,  label: 'Home',    route: '/' },
    { id: '2', angle: -150, label: 'Content', submenu: 'content' },
    { id: '3', angle: 150,  label: 'About',   route: '/about' },
    { id: '4', angle: 90,   label: 'Apps',    submenu: 'apps' },
  ];
  const contentItems = [
    { id: 'c0', angle: 180,  label: '← Back',   back: true },
    { id: 'c1', angle: -135, label: 'Dev Log',  route: '/tag/devlog' },
    { id: 'c2', angle: -90,  label: 'ZenPost',  route: '/tag/zenpost' },
    { id: 'c3', angle: 135,  label: 'ZenOrbit', route: '/tag/zenorbit' },
    { id: 'c4', angle: 90,   label: 'Release',  route: '/tag/release' },
  ];
  const appsItems = [
    { id: 'a0', angle: 180,  label: '← Back',  back: true },
    { id: 'a1', angle: -90,  label: 'ZenPost', route: 'https://zenpost.denisbitter.de', external: true },
    { id: 'a2', angle: 90,   label: 'ZenOrbit', route: 'https://zenorbit.denisbitter.de', external: true },
  ];
  const menuItems = level === 'content' ? contentItems : level === 'apps' ? appsItems : mainItems;

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setLevel('main');
      setLogoRotation(0);
    } else {
      setIsOpen(true);
      setLogoRotation(180);
    }
  };

  const handleItemClick = (item) => {
    if (item.back) {
      setLevel('main');
      return;
    }
    if (item.submenu) {
      setLevel(item.submenu);
      return;
    }
    setIsOpen(false);
    setLevel('main');
    setLogoRotation(0);
    if (item.external) {
      window.open(item.route, '_blank', 'noopener');
    } else {
      window.location.hash = item.route === '/' ? '/' : item.route;
    }
  };

  const bs = activeResponsive.buttonSize;
  const r = activeResponsive.radius;
  const isMobile = viewport.width <= 768;
  const scrollProgress = Math.max(0, Math.min(1, viewport.scrollY / viewport.scrollMax));
  const trackTop = isMobile ? 88 : 160;
  const trackBottom = isMobile ? 16 : 28;
  const maxTop = Math.max(trackTop, viewport.height - bs - trackBottom);
  const menuTop = trackTop + (maxTop - trackTop) * scrollProgress;

  return (
    <div style={{ position: 'fixed', top: `${menuTop}px`, right: isMobile ? '0.5rem' : '1.5rem', zIndex: 1000, width: bs, height: bs }}>
      {/* Button */}
      <motion.div
        onClick={handleToggle}
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: 'spring', stiffness: config.animation.logoStiffness, damping: config.animation.logoDamping }}
        style={{
          width: bs, height: bs,
          backgroundColor: config.colors.buttonBg,
          border: `${config.colors.buttonOutlineWidth}px solid ${config.colors.buttonOutline}`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: `${Math.round(bs * 0.3)}px`,  color: isLightTheme ? '#1a1a1a' : '#e8e3d7',
          cursor: 'pointer',
          fontFamily: 'IBM Plex Mono, monospace',
          userSelect: 'none',
        }}
      >
        {config.logoType === 'image' && config.logoSrc
          ? <img src={config.logoSrc} alt="menu" style={{ width: '85%', height: '85%', objectFit: 'contain', borderRadius: '50%' }} />
          : config.logoText || 'B'
        }
      </motion.div>

      {/* Menu items — positioned relative to button center */}
      {menuItems.map((item, index) => {
        const angleRad = (item.angle * Math.PI) / 180;
        const targetX = isOpen ? Math.cos(angleRad) * r : 0;
        const targetY = isOpen ? Math.sin(angleRad) * r : 0;
        return (
          <motion.div
            key={item.id}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{
              x: targetX,
              y: targetY,
              scale: isOpen ? 1 : 0,
              opacity: isOpen ? 1 : 0,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.05 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: bs, height: bs,
              backgroundColor: config.colors.menuItemBg,
              border: `${config.colors.menuItemOutlineWidth}px solid ${config.colors.menuItemOutline}`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: activeResponsive.menuItemFontSize,
              color: config.colors.menuItemText,
              cursor: 'pointer',
              fontFamily: 'monospace',
              textAlign: 'center',
              padding: '4px',
              pointerEvents: isOpen ? 'auto' : 'none',
            }}
            onClick={() => handleItemClick(item)}
          >
            {item.label}
          </motion.div>
        );
      })}
    </div>
  );
};

export default OrbitMenu;
