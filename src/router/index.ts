import { createRouter, createWebHashHistory } from "vue-router";
import indexVue from "@/pages/index.vue";
import defaultLayout from "@/layouts/default.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
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