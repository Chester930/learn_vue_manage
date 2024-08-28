import { createRouter, createWebHistory } from "vue-router";
import Admin from "../views/Admin.vue";
import Billing from "../views/Billing.vue";
import Dashboard from "../views/Dashboard.vue";
import Profile from "../views/Profile.vue";
import RTL from "../views/Rtl.vue";
import Signin from "../views/Signin.vue";
import Signup from "../views/Signup.vue";
import Tables from "../views/Tables.vue";
import VirtualReality from "../views/VirtualReality.vue";
import Login from "../views/login.vue";
import Creator from "../views/Creator.vue";


const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/dashboard-default",
  },
  {
    path: "/dashboard-default",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
  },
  {
    path: "/billing",
    name: "Billing",
    component: Billing,
  },
  {
    path: "/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,
  },
  {
    path: "/rtl-page",
    name: "RTL",
    component: RTL,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/creator",
    name: "Creator",
    component: Creator,
  },
  {
    path: "/course",
    name: "Course",
    component: Creator,
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Signup,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;
