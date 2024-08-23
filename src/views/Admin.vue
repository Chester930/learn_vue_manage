vue
<script setup>
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import { ref, onMounted } from 'vue';
import axios from 'axios';

const usernameSearch = ref('');
const emailSearch = ref('');
const users = ref([]);
const searchType = ref('username'); // 預設搜尋類型為名稱

// 搜尋用戶
const searchUsers = async () => {
  try {
    let response;
    if (searchType.value === 'username') {
      response = await axios.get('/admin/users/searchByUsername', { params: { username: usernameSearch.value } });
    } else if (searchType.value === 'email') {
      response = await axios.get('/admin/users/searchByEmail', { params: { email: emailSearch.value } });
    } else {
      response = await axios.get('/admin/users/all'); // 顯示全部
    }
    users.value = response.data; // 更新用戶列表
  } catch (error) {
    console.error('搜尋用戶時出錯:', error);
  }
};

// 刪除用戶
const deleteUser = async (id) => {
  if (confirm('您確定要刪除這個用戶嗎？')) {
    try {
      const response = await axios.delete(`/admin/users/delete/${id}`);
      console.log(response.data); // 顯示刪除結果
      await searchUsers(); // 刪除後重新搜尋用戶列表
    } catch (error) {
      console.error('刪除用戶時出錯:', error);
    }
  }
};

// 初始化頁面
onMounted(() => {
  searchUsers(); // 頁面加載時自動搜尋用戶
});

// 切換搜尋類型
const toggleSearchType = () => {
  searchType.value = searchType.value === 'username' ? 'email' : 'username';
  usernameSearch.value = ''; // 清空名稱搜尋框
  emailSearch.value = ''; // 清空電子郵件搜尋框
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
                
                <div class="button-group"> <argon-button color="info" size="sm" @click="toggleSearchType" class="ml-2">
                        {{ searchType === 'username' ? '依Email搜尋' : '依名稱搜尋' }}
                    </argon-button>
                    <argon-button color="success" size="sm" @click="searchUsers" class="ml-2">搜尋全部</argon-button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6" v-if="searchType === 'username'">
                  <argon-input id="username-search" type="text" placeholder="輸入名稱" v-model="usernameSearch" />
                </div>
                <div class="col-md-6" v-else>

                  <argon-input id="email-search" type="email" placeholder="輸入電子郵件" v-model="emailSearch" />
                </div>
              </div>
              <argon-button 
                color="primary" 
                size="sm" 
                @click="handleSearch" 
                class="mt-3"
              >
                {{ isSearchInputEmpty ? '搜尋全部' : '搜尋' }}
              </argon-button>
            </div>
          </div>
          <div class="card mt-4">
            <div class="card-header pb-0">
              <div class="d-flex align-items-center">
                <p class="mb-0">用戶列表</p>
              </div>
            </div>
            <div class="card-body">
              <table class="table">
                <thead>
                  <tr>
                    <th>會員ID</th>
                    <th>名稱</th>
                    <th>Email</th>
                    <th>建立日期</th>
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