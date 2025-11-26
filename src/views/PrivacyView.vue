<template>
  <div class="privacy-view">
    <div class="privacy-container">
      <header class="privacy-header">
        <h1>Politique de Confidentialité</h1>
        <p class="last-updated">Dernière mise à jour : {{ lastUpdated }}</p>
      </header>

      <section class="privacy-section">
        <h2>1. Introduction</h2>
        <p>
          Bienvenue sur Travel Book JS. Cette politique de confidentialité explique comment nous collectons
          et utilisons vos données lorsque vous utilisez notre application web.
        </p>
        <p>
          <strong>Important :</strong> Travel Book JS est une application entièrement <strong>client-side</strong>
          (front-only). Aucune donnée n'est envoyée à nos serveurs. Tous les traitements s'effectuent dans
          votre navigateur.
        </p>
      </section>

      <section class="privacy-section">
        <h2>2. Données traitées localement (dans votre navigateur)</h2>
        <p>
          Lorsque vous utilisez Travel Book JS, les données suivantes sont traitées <strong>uniquement
          dans votre navigateur</strong> :
        </p>
        <ul>
          <li><strong>Fichiers Polarsteps</strong> : vos exports JSON contenant vos voyages, étapes et photos</li>
          <li><strong>Photos</strong> : vos images de voyage chargées depuis votre appareil</li>
          <li><strong>Données d'édition</strong> : modifications apportées à vos étapes et métadonnées</li>
          <li><strong>Travel Book généré</strong> : le document HTML final créé localement</li>
        </ul>
        <p>
          <strong>Ces données ne quittent JAMAIS votre navigateur.</strong> Elles ne sont pas stockées sur
          nos serveurs, car nous n'avons pas de serveur backend. L'application fonctionne intégralement
          côté client (pages statiques hébergées sur GitHub Pages).
        </p>
      </section>

      <section class="privacy-section">
        <h2>3. Services tiers et cookies</h2>
        
        <h3>3.1. Microsoft Clarity</h3>
        <p>
          Nous utilisons <strong>Microsoft Clarity</strong> pour comprendre comment vous utilisez notre site
          et améliorer votre expérience. Clarity collecte :
        </p>
        <ul>
          <li>Des données de navigation (pages visitées, clics, scrolling)</li>
          <li>Des enregistrements de session anonymisés</li>
          <li>Des cartes de chaleur (heatmaps) d'interaction</li>
        </ul>
        <p>
          Clarity utilise des cookies techniques et autres technologies de suivi pour capturer ces données.
          Les informations personnelles identifiables (PII) sont automatiquement masquées par Clarity.
        </p>
        <p>
          <strong>En utilisant ce site, vous acceptez que nous et Microsoft puissions collecter et
          utiliser ces données.</strong>
        </p>
        <p>
          Pour en savoir plus sur la façon dont Microsoft collecte et utilise vos données, consultez la
          <a
            href="https://privacy.microsoft.com/en-us/privacystatement"
            target="_blank"
            rel="noopener noreferrer"
            class="privacy-link"
          >
            Déclaration de confidentialité Microsoft
          </a>.
        </p>

        <h3>3.2. Hébergement (GitHub Pages)</h3>
        <p>
          Notre site est hébergé sur <strong>GitHub Pages</strong>. GitHub peut collecter des journaux
          techniques (logs) incluant votre adresse IP et les pages consultées. Consultez la
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
            class="privacy-link"
          >
            Politique de confidentialité GitHub
          </a>
          pour plus d'informations.
        </p>
      </section>

      <section class="privacy-section">
        <h2>4. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès</strong> : demander quelles données sont collectées</li>
          <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
          <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
          <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
        </ul>
        <p>
          Étant donné que nous ne stockons aucune donnée personnelle (architecture client-only),
          vos données de voyage restent sur votre appareil et vous pouvez les supprimer à tout moment
          en vidant le cache de votre navigateur.
        </p>
        <p>
          Pour toute question concernant vos données collectées par Microsoft Clarity, veuillez consulter
          les ressources Microsoft mentionnées ci-dessus.
        </p>
      </section>

      <section class="privacy-section">
        <h2>5. Sécurité</h2>
        <p>
          Nous prenons la sécurité au sérieux. Comme toutes vos données sont traitées localement dans
          votre navigateur et ne sont jamais envoyées à nos serveurs, le risque de fuite de données
          personnelles liées à vos voyages est minimal.
        </p>
        <p>
          Le code source de l'application est
          <a
            href="https://github.com/stalina/travel-book-js"
            target="_blank"
            rel="noopener noreferrer"
            class="privacy-link"
          >
            open-source et disponible sur GitHub
          </a>, vous pouvez donc auditer le code vous-même.
        </p>
      </section>

      <section class="privacy-section">
        <h2>6. Modifications de cette politique</h2>
        <p>
          Nous pouvons mettre à jour cette politique de confidentialité occasionnellement. Toute
          modification sera publiée sur cette page avec une date de mise à jour actualisée.
        </p>
      </section>

      <section class="privacy-section">
        <h2>7. Contact</h2>
        <p>
          Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter
          via
          <a
            href="https://github.com/stalina/travel-book-js/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="privacy-link"
          >
            GitHub Issues
          </a>.
        </p>
      </section>

      <footer class="privacy-footer">
        <router-link to="/" class="back-link">← Retour à l'accueil</router-link>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const lastUpdated = computed(() => {
  const date = new Date('2025-11-26')
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<style scoped>
.privacy-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.privacy-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.privacy-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
}

.privacy-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.last-updated {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-style: italic;
}

.privacy-section {
  margin-bottom: 2.5rem;
}

.privacy-section h2 {
  font-size: 1.5rem;
  color: #667eea;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.privacy-section h3 {
  font-size: 1.2rem;
  color: #764ba2;
  margin: 1.5rem 0 0.75rem;
}

.privacy-section p {
  line-height: 1.8;
  color: #34495e;
  margin-bottom: 1rem;
}

.privacy-section ul {
  margin: 1rem 0 1rem 2rem;
  line-height: 1.8;
  color: #34495e;
}

.privacy-section li {
  margin-bottom: 0.5rem;
}

.privacy-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s;
}

.privacy-link:hover {
  border-bottom-color: #667eea;
}

.privacy-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f0f0f0;
  text-align: center;
}

.back-link {
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  border-radius: 8px;
  transition: all 0.3s;
}

.back-link:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .privacy-container {
    padding: 2rem 1.5rem;
  }

  .privacy-header h1 {
    font-size: 2rem;
  }

  .privacy-section h2 {
    font-size: 1.3rem;
  }

  .privacy-section ul {
    margin-left: 1.5rem;
  }
}
</style>
