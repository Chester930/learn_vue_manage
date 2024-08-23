<script setup>
import { ref } from "vue";
import { onBeforeUnmount, onBeforeMount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";
import Navbar from "@/examples/PageLayout/Navbar.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import ArgonAlert from "@/components/ArgonAlert.vue";

const body = document.getElementsByTagName("body")[0];
const store = useStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
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

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = "請輸入郵箱和密碼";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const response = await axios.post("http://localhost:8080/myapp/user/login", {
      email: email.value,
      password: password.value
    });

    const data = response.data;

    if (data.success) {
      console.log("登入成功:", data);
      successMessage.value = data.message;
      
      // 存儲 token 和用戶信息
      localStorage.setItem('token', data.token);
      store.commit('setUser', { id: data.id, email: data.email });

      setTimeout(() => {
        router.push('/');  // 假設首頁的路由是 '/'
      }, 1000);
    } else {
      console.error("登入失敗:", data);
      errorMessage.value = data.message;
    }

  } catch (error) {
    console.error("登入請求失敗:", error);
    errorMessage.value = "登入請求失敗，請稍後再試";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar
          isBlur="blur  border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow"
          v-bind:darkMode="true"
          isBtn="bg-gradient-success"
        />
      </div>
    </div>
  </div>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <div class="mx-auto col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0">
              <div class="card card-plain">
                <div class="pb-0 card-header text-start">
                  <h4 class="font-weight-bolder">登入</h4>
                  <p class="mb-0">輸入您的郵箱和密碼以登入</p>
                </div>
                <div class="card-body">
                  <form role="form" @submit.prevent="handleLogin">
                    <div class="mb-3">
                      <argon-input
                        v-model="email"
                        id="email"
                        type="email"
                        placeholder="郵箱"
                        name="email"
                        size="lg"
                      />
                    </div>
                    <div class="mb-3">
                      <argon-input
                        v-model="password"
                        id="password"
                        type="password"
                        placeholder="密碼"
                        name="password"
                        size="lg"
                      />
                    </div>
                    <argon-switch v-model="rememberMe" id="rememberMe" name="remember-me">
                      記住我
                    </argon-switch>

                    <argon-alert v-if="errorMessage" color="danger" dismissible>
                      {{ errorMessage }}
                    </argon-alert>
                    <argon-alert v-if="successMessage" color="success" dismissible>
                      {{ successMessage }}
                    </argon-alert>

                    <div class="text-center">
                      <argon-button
                        class="mt-4"
                        variant="gradient"
                        color="success"
                        fullWidth
                        size="lg"
                        type="submit"
                        :disabled="isLoading"
                      >
                        {{ isLoading ? '登入中...' : '登入' }}
                      </argon-button>
                    </div>
                  </form>
                </div>
                <div class="px-1 pt-0 text-center card-footer px-lg-2">
                  <p class="mx-auto mb-4 text-sm">
                    還沒有帳號？
                    <a
                      href="Signup"
                      class="text-success text-gradient font-weight-bold"
                      >註冊</a
                    >
                  </p>
                </div>
              </div>
            </div>
            <div class="top-0 my-auto text-center col-6 d-lg-flex d-none h-100 pe-0 position-absolute end-0 justify-content-center flex-column">
              <div
                class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
                style="
                  background-image: url('https://raw.githubusercontent.com/creativetimofficial/public-assets/master/argon-dashboard-pro/assets/img/signin-ill.jpg');
                  background-size: cover;
                "
              >
                <span class="mask bg-gradient-success opacity-6"></span>
                <h4 class="mt-5 text-white font-weight-bolder position-relative">
                  "注意力是新的貨幣"
                </h4>
                <p class="text-white position-relative">
                  寫作看起來越輕鬆，作者實際上在過程中付出的努力就越多。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>