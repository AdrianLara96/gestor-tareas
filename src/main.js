import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

/* --- Importar css --- */
import './assets/css/utils.css'     // Clases css reutilizables
import './assets/css/style.css'     // Configuraciones y paleta de colores


createApp(App)
    .use(router)
    .mount('#app')