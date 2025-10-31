<template>
  <router-view />
</template>

<script setup lang="ts"></script>

<style>
/**
 * TRAVEL BOOK JS - DESIGN SYSTEM
 * Système de design moderne et cohérent
 */

/* === VARIABLES CSS === */
:root {
  /* Palette de couleurs principale - Voyage & Adventure */
  --color-primary: #FF6B6B;
  --color-primary-light: #FF8E8E;
  --color-primary-dark: #E84545;
  --color-secondary: #4ECDC4;
  --color-secondary-light: #7ED6D0;
  --color-secondary-dark: #3DB8AF;
  --color-accent: #FFE66D;
  --color-accent-dark: #F7D945;
  
  /* Couleurs neutres */
  --color-background: #FAFBFC;
  --color-surface: #FFFFFF;
  --color-surface-raised: #FFFFFF;
  --color-border: #E5E8EB;
  --color-border-light: #F0F2F4;
  
  /* Texte */
  --color-text-primary: #1A1F36;
  --color-text-secondary: #697386;
  --color-text-tertiary: #9CA6B8;
  --color-text-inverse: #FFFFFF;
  
  /* États */
  --color-success: #46C93A;
  --color-warning: #FFB84D;
  --color-error: #F56565;
  --color-info: #4299E1;
  
  /* Typographie */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --font-family-display: 'Georgia', 'Times New Roman', serif;
  --font-family-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace;
  
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Espacement */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */
  --spacing-4xl: 6rem;     /* 96px */
  
  /* Bordures */
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-2xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
  
  /* Ombres */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* === BASE STYLES === */
:root { 
  color-scheme: light dark; 
}

html, body, #app { 
  height: 100%; 
  margin: 0; 
}

body { 
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*, *::before, *::after {
  box-sizing: border-box;
}

/* === ANIMATIONS === */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* === UTILITY CLASSES === */
.fade-in {
  animation: fadeIn var(--transition-base);
}

.slide-in-up {
  animation: slideInUp var(--transition-slow);
}
</style>
