<script setup>
import { ref } from "vue";
import { onBeforeUnmount, onBeforeMount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";

import Navbar from "@/examples/PageLayout/Navbar.vue";
import AppFooter from "@/examples/PageLayout/Footer.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";

const body = document.getElementsByTagName("body")[0];
const store = useStore();
const router = useRouter();

const username = ref("");
const email = ref("");
const password = ref("");
const agreeTerms = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});

const handleRegister = async () => {
  console.log("Agree Terms:", agreeTerms.value);

  if (!agreeTerms.value) {
    errorMessage.value = "Please agree to the Terms and Conditions";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const response = await axios.post("http://localhost:8080/myapp/user/register", {
      username: username.value,
      email: email.value,
      pwd: password.value
    });

    console.log("Registration successful:", response.data);
    successMessage.value = "跳轉登入頁面中...";
    
    // 延遲 2 秒後跳轉到首頁
    setTimeout(() => {
      router.push('/signin');  // 假設首頁的路由是 '/'
    }, 1000);

  } catch (error) {
    console.error("Registration failed:", error);
    errorMessage.value = "Registration failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar isBtn="bg-gradient-light" />
      </div>
    </div>
  </div>
  <main class="main-content mt-0">
    <div
      class="page-header align-items-start min-vh-50 pt-5 pb-11 m-3 border-radius-lg"
      style="
        background-image: url('https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signup-cover.jpg');
        background-position: top;
      "
    >
      <span class="mask bg-gradient-dark opacity-6"></span>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 text-center mx-auto">
            <h1 class="text-white mb-2 mt-5">歡迎!</h1>
            <p class="text-lead text-white">
                建立新帳戶
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row mt-lg-n10 mt-md-n11 mt-n10 justify-content-center">
        <div class="col-xl-4 col-lg-5 col-md-7 mx-auto">
          <div class="card z-index-0">
            <div class="card-header text-center pt-4">
              <h5>註冊</h5>
            </div>
            <div class="row px-xl-5 px-sm-4 px-3">
              <!-- Social login buttons (Facebook, Apple, Google) remain unchanged -->
            </div>
            <div class="card-body">
              <form role="form" @submit.prevent="handleRegister">
                <argon-input
                  id="name"
                  v-model="username"
                  type="text"
                  placeholder="名稱"
                  aria-label="Name"
                />
                <argon-input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="Email"
                  aria-label="Email"
                />
                <argon-input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="密碼"
                  aria-label="Password"
                />
                <div class="form-check">
                  <input
                    id="flexCheckDefault"
                    class="form-check-input"
                    type="checkbox"
                    v-model="agreeTerms"
                  />
                  <label class="form-check-label" for="flexCheckDefault">
                    我同意
                    <a href="javascript:;" class="text-dark font-weight-bolder"
                      >條款與條件</a
                    >
                  </label>
                </div>
                <argon-alert v-if="errorMessage" color="danger" dismissible>
                  {{ errorMessage }}
                </argon-alert>
                <argon-alert v-if="successMessage" color="success" dismissible>
                  {{ successMessage }}
                </argon-alert>
                <div class="text-center">
                  <argon-button
                    type="submit"
                    fullWidth
                    color="dark"
                    variant="gradient"
                    class="my-4 mb-2"
                    :disabled="isLoading"
                  >
                    {{ isLoading ? 'Registering...' : '確認' }}
                  </argon-button>
                </div>
                <p class="text-sm mt-3 mb-0">
                  已經有帳戶？
                  <a href="javascript:;" class="text-dark font-weight-bolder"
                    >登入</a
                  >
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <app-footer />
</template>