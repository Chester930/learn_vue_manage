vue

<script setup>
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const usernameSearch = ref('');
const emailSearch = ref('');
const users = ref([]);
const searchType = ref('username'); // 預設搜尋類型為名稱
const totalUsers = ref(0);
const message = ref('');

// 計算屬性：判斷搜尋輸入是否為空
const isSearchInputEmpty = computed(() => {
  return searchType.value === 'username' ? !usernameSearch.value : !emailSearch.value;
});

// 搜尋用戶
const searchUsers = async () => {
  try {
    let response;
    if (searchType.value === 'username' && usernameSearch.value) {
      response = await axios.get('/admin/users/searchByUsername', { params: { username: usernameSearch.value } });
    } else if (searchType.value === 'email' && emailSearch.value) {
      response = await axios.get('/admin/users/searchByEmail', { params: { email: emailSearch.value } });
    } else {
      response = await axios.get('/admin/users/all');
    }
    const data = JSON.parse(response.data);
    if (data.success) {
      users.value = data.users;
      message.value = '';
    } else {
      users.value = [];
      message.value = data.message;
    }
  } catch (error) {
    console.error('搜尋用戶時出錯:', error);
    message.value = '搜尋用戶時出錯';
  }
};

// 刪除用戶
const deleteUser = async (id) => {
  if (confirm('您確定要刪除這個用戶嗎？')) {
    try {
      const response = await axios.delete(`/admin/users/delete/${id}`);
      const data = JSON.parse(response.data);
      if (data.success) {
        message.value = data.message;
        await searchUsers(); // 刪除後重新搜尋用戶列表
        await fetchTotalUsers(); // 更新用戶總數
      } else {
        message.value = data.message;
      }
    } catch (error) {
      console.error('刪除用戶時出錯:', error);
      message.value = '刪除用戶時出錯';
    }
  }
};

// 獲取用戶總數
const fetchTotalUsers = async () => {
  try {
    const response = await axios.get('/admin/users/count');
    const data = JSON.parse(response.data);
    if (data.success) {
      totalUsers.value = data.count;
    } else {
      message.value = '獲取用戶總數失敗';
    }
  } catch (error) {
    console.error('獲取用戶總數時出錯:', error);
    message.value = '獲取用戶總數時出錯';
  }
};

// 初始化頁面
onMounted(() => {
  searchUsers();
  fetchTotalUsers();
});

// 切換搜尋類型
const toggleSearchType = () => {
  searchType.value = searchType.value === 'username' ? 'email' : 'username';
  usernameSearch.value = '';
  emailSearch.value = '';
};

// 處理搜尋
const handleSearch = () => {
  searchUsers();
};

</script>

<template>
  <main>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header pb-0">
              <h5 class="mb-0">用戶搜尋</h5>
              <div class="d-flex align-items-center">
                <div class="button-group">
                  <argon-button color="info" size="sm" @click="toggleSearchType" class="ml-2">
                    {{ searchType === 'username' ? '依Email搜尋' : '依名稱搜尋' }}
                  </argon-button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-12">
                  <div class="input-group">
                    <div v-if="searchType === 'username'">
                      <argon-input id="username-search" type="text" placeholder="輸入名稱" v-model="usernameSearch" />
                    </div>
                    <div v-else>
                      <argon-input id="email-search" type="email" placeholder="輸入電子郵件" v-model="emailSearch" />
                    </div>
                    <div class="input-group-append">
                      <argon-button 
                        color="primary" 
                        size="sm" 
                        @click="handleSearch" 
                      >
                        {{ isSearchInputEmpty ? '搜尋全部' : '搜尋' }}
                      </argon-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="card mt-4">
            <div class="card-header pb-0">
              <div class="d-flex align-items-center justify-content-between">
                <p class="mb-0">用戶列表</p>
                <p class="mb-0">總用戶數: {{ totalUsers }}</p>
              </div>
            </div>
            <div class="card-body">
              <p v-if="message" class="text-danger">{{ message }}</p>
              <table class="table" v-if="users.length > 0">
                <thead>
                  <tr>
                    <th>會員ID</th>
                    <th>名稱</th>
                    <th>Email</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <argon-button color="danger" size="sm" @click="deleteUser(user.id)">刪除</argon-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>