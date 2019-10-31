const routes = [
  {
    path: "/",
    component: () => import("layouts/Index.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      { path: "/contract/:id", component: () => import("pages/Contract.vue") },
      { path: "/stats", component: () => import("pages/Stats.vue") }
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== "ssr") {
  routes.push({
    path: "*",
    component: () => import("pages/Error404.vue")
  });
}

export default routes;
