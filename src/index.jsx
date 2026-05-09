import React from 'react';
import BitterButtonWithMenu from '@denisbitter/bitter-button-menu';

const menuConfig = {
  "visual": {
    "radius": 100,
    "menuOffset": 150,
    "colors": {
      "primary": "#AC8E66",
      "primaryDark": "#8F734F",
      "background": "#1b1b1f",
      "backgroundDark": "#131316",
      "text": "#ECE1CF",
      "border": "#AC8E66",
      "borderHighlight": "#AC8E66",
      "backdrop": "rgba(0, 0, 0, 0.32)"
    },
    "button": {
      "width": 57,
      "height": 57,
      "fontSize": "11px",
      "fontFamily": "monospace",
      "borderRadius": "50%"
    },
    "menuItem": {
      "borderRadius": "50%",
      "borderWidth": 2,
      "fontWeight": 600,
      "letterSpacing": "0px",
      "textTransform": "none"
    },
    "backdrop": {
      "blur": "8px",
      "opacity": 0.4
    }
  },
  "animation": {
    "logo": {
      "openRotation": 180,
      "closeRotation": 0,
      "stiffness": 100,
      "damping": 50
    },
    "menuItem": {
      "stiffness": 260,
      "damping": 20,
      "staggerDelay": 0.05
    },
    "scroll": {
      "stiffness": 150,
      "damping": 11
    },
    "backdrop": {
      "duration": 0.2
    }
  },
  "behavior": {
    "scrollBehavior": "smooth",
    "closeOnBackdropClick": true,
    "closeOnItemClick": true,
    "resetSubmenuOnClose": true
  },
  "tooltip": {
    "enabled": true,
    "duration": 6000,
    "repeatDelay": 10000,
    "maxShows": 2,
    "text": "Menü öffnen"
  },
  "accessibility": {
    "ariaLabel": "Hauptmenü",
    "keyboardNavigation": true,
    "focusTrapping": true
  },
  "layers": [
    {
      "id": "main",
      "radius": 100,
      "startAngle": 0,
      "endAngle": -180
    }
  ]
};

const menuItems = [
  {
    "id": "1",
    "label": "Apps",
    "angle": 0,
    "action": "openSubmenu",
    "submenu": "apps",
    "hasSubmenu": true
  },
  {
    "id": "2",
    "label": "About",
    "angle": -60,
    "route": "/about"
  },
  {
    "id": "3",
    "label": "Dev log",
    "angle": -120,
    "route": "/zenlab2"
  },
  {
    "id": "4",
    "label": "Sag Hallo",
    "angle": -180,
    "route": "/contact"
  }
];

const submenuItems = {
  apps: [
    {
      "id": "back",
      "label": "Back",
      "angle": 0,
      "action": "closeSubmenu",
      "isBack": true
    },
    {
      "id": "zenpost",
      "label": "ZenPost",
      "angle": -90,
      "route": "/zenpost"
    },
    {
      "id": "zenorbit",
      "label": "ZenOrbit",
      "angle": -180,
      "route": "/zenorbit"
    }
  ]
};

function CustomRadialMenu({ logoSrc }) {
  return (
    <BitterButtonWithMenu
      logoSrc={logoSrc}
      logoAlt="Menu"
      mainMenuItems={menuItems}
      submenuItems={submenuItems}
      config={menuConfig}
      accentColor="#AC8E66"
      tooltipText="Open Menu"
    />
  );
}

export default CustomRadialMenu;
