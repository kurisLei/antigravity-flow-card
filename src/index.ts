import type { App } from 'vue';
import AntigravityFlowCard from './components/antigravity-flow-card.vue';

function install(app: App) {
  app.component('AntigravityFlowCard', AntigravityFlowCard);
}

export { AntigravityFlowCard, install };
