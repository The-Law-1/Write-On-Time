import { createRouter, createWebHistory } from "vue-router";
import indexVue from "@/pages/index.vue";
import defaultLayout from "@/layouts/default.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/Write-On-Time/",
      name: "home",
      component: indexVue,
      meta: {
        layout: defaultLayout,
      },
    },
  ],
});

router.beforeEach(async () => {

});

export default router;