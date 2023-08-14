import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/components/ef/index.css'
Vue.use(ElementUI, {size: 'small'})

new Vue({
  render: h => h(App),
}).$mount('#app')
