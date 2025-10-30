<template>
  <header class="viewer-header">
    <a
      href="/index.html"
      class="new-book-btn"
      role="button"
      aria-label="Démarrer un nouveau travel book"
      @click="onNavigate($event)"
    >Nouveau travel book</a>
    <span class="subtitle">Viewer du Travel Book généré</span>
  </header>
</template>

<script setup lang="ts">
// Pas de props actuellement; export par défaut implicite via SFC
function onNavigate(ev: MouseEvent) {
  const target = ev.currentTarget as HTMLAnchorElement
  if (target.hasAttribute('data-no-confirm')) return
  const ok = window.confirm('Quitter le viewer et démarrer un nouveau travel book ?')
  if (!ok) {
    ev.preventDefault()
    ev.stopPropagation()
  }
}
</script>

<style scoped>
.viewer-header {
  font-family: system-ui, Arial, sans-serif;
  background: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: .75rem 1rem;
}
.new-book-btn {
  background: #e53935;
  color: #fff;
  padding: .5rem .9rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,.15);
  outline: none;
  line-height: 1.2;
  transition: background .15s ease, box-shadow .15s ease;
}
.new-book-btn:hover { background:#d32f2f; }
.new-book-btn:active { background:#c62828; }
.new-book-btn:focus-visible { box-shadow:0 0 0 3px rgba(229,57,53,0.35); }
.new-book-btn:visited { color:#fff; }
.subtitle { font-size:.9rem; color:#555; }
</style>
