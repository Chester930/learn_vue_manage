<template>
    <div class="container">
      <div class="form-container">
        <h2>{{ isLogin ? '登入' : '註冊' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group" v-if="!isLogin">
            <label for="username">用戶名</label>
            <input type="text" id="username" v-model="username" required>
          </div>
          <div class="form-group">
            <label for="email">電子郵件</label>
            <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-group">
            <label for="password">密碼</label>
            <input type="password" id="password" v-model="password" required>
          </div>
          <button type="submit" class="submit-btn">{{ isLogin ? '登入' : '註冊' }}</button>
        </form>
        <p class="toggle-form">
          {{ isLogin ? '還沒有帳號？' : '已經有帳號了？' }}
          <a href="#" @click.prevent="toggleForm">{{ isLogin ? '註冊' : '登入' }}</a>
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  
  export default {
    setup() {
      const isLogin = ref(true)
      const username = ref('')
      const email = ref('')
      const password = ref('')
  
      const toggleForm = () => {
        isLogin.value = !isLogin.value
        username.value = ''
        email.value = ''
        password.value = ''
      }
  
      const handleSubmit = () => {
        if (isLogin.value) {
          console.log('登入', { email: email.value, password: password.value })
        } else {
          console.log('註冊', { username: username.value, email: email.value, password: password.value })
        }
        // 這裡可以添加實際的登入或註冊邏輯
      }
  
      return {
        isLogin,
        username,
        email,
        password,
        toggleForm,
        handleSubmit
      }
    }
  }
  </script>
  
  <style scoped>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
  }
  
  .form-container {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .submit-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .submit-btn:hover {
    background-color: #40a9ff;
  }
  
  .toggle-form {
    text-align: center;
    margin-top: 1rem;
  }
  
  a {
    color: #1890ff;
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  </style>