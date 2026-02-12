<template>
  <div v-if="showBanner" class="cookie-consent-overlay">
    <div class="cookie-consent-banner">
      <div class="cookie-consent-content">
        <h3>🍪 Cookies et confidentialité</h3>
        <p>
          Ce site utilise Google Analytics pour comprendre comment les visiteurs utilisent l'application.
          <strong>Aucune donnée personnelle n'est collectée ou transmise à un serveur.</strong>
          Toutes vos données restent sur votre appareil.
        </p>
        <p class="cookie-consent-info">
          Les cookies Analytics nous aident à améliorer votre expérience en nous informant des fonctionnalités
          les plus utilisées. Vous pouvez refuser ces cookies sans impact sur l'utilisation de l'application.
        </p>
        <div class="cookie-consent-actions">
          <button @click="acceptCookies" class="btn-accept">
            Accepter
          </button>
          <button @click="refuseCookies" class="btn-refuse">
            Refuser
          </button>
          <a href="#/privacy" @click="showBanner = false" class="link-privacy">
            En savoir plus
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { analyticsService } from '../services/analytics.service'

const showBanner = ref(false)

/**
 * Vérifie si l'utilisateur a déjà fait un choix concernant les cookies
 */
const checkConsentStatus = (): void => {
  const consent = localStorage.getItem('analytics_consent')
  if (consent === null) {
    // Aucun choix n'a été fait, on affiche la bannière
    showBanner.value = true
  }
}

/**
 * L'utilisateur accepte les cookies Analytics
 */
const acceptCookies = (): void => {
  analyticsService.updateConsent(true)
  showBanner.value = false
  
  // Recharger la page pour initialiser GTM
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

/**
 * L'utilisateur refuse les cookies Analytics
 */
const refuseCookies = (): void => {
  analyticsService.updateConsent(false)
  showBanner.value = false
}

onMounted(() => {
  checkConsentStatus()
})
</script>

<style scoped>
.cookie-consent-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in;
}

.cookie-consent-banner {
  background: white;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.4s ease-out;
}

.cookie-consent-content {
  padding: 2rem;
}

.cookie-consent-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #333;
}

.cookie-consent-content p {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.6;
}

.cookie-consent-info {
  font-size: 0.9rem;
  color: #888;
}

.cookie-consent-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn-accept,
.btn-refuse {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-accept {
  background: #4CAF50;
  color: white;
}

.btn-accept:hover {
  background: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.btn-refuse {
  background: #f5f5f5;
  color: #666;
}

.btn-refuse:hover {
  background: #e0e0e0;
}

.link-privacy {
  color: #1976D2;
  text-decoration: none;
  font-size: 0.9rem;
  margin-left: auto;
}

.link-privacy:hover {
  text-decoration: underline;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .cookie-consent-content {
    padding: 1.5rem;
  }

  .cookie-consent-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-accept,
  .btn-refuse {
    width: 100%;
  }

  .link-privacy {
    margin-left: 0;
    text-align: center;
  }
}
</style>
