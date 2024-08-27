vue
<script setup>
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const usernameSearch = ref('');
const emailSearch = ref('');
const users = ref([]);
const searchType = ref('username');
const totalUsers = ref(0);
const message = ref('');
const isLoading = ref(false);

const isSearchInputEmpty = computed(() => {
  return searchType.value === 'username' ? !usernameSearch.value : !emailSearch.value;
});

const searchUsers = async () => {
  isLoading.value = true;
  message.value = '';
  try {
    let response;
    if (searchType.value === 'username' && usernameSearch.value) {
      response = await axios.get('http://localhost:8080/myapp/admin/users/searchByUsername', { params: { username: usernameSearch.value } });
    } else if (searchType.value === 'email' && emailSearch.value) {
      response = await axios.get('http://localhost:8080/myapp/admin/users/searchByEmail', { params: { email: emailSearch.value } });
    } else {
      response = await axios.get('http://localhost:8080/myapp/admin/users/all');
    }

    const data = response.data;
    if (data.success) {
      users.value = data.users;
      if (users.value.length === 0) {
        message.value = '沒有找到匹配的用戶';
      }
    } else {
      users.value = [];
      message.value = data.message || '搜尋失敗';
    }
  } catch (error) {
    console.error('搜尋用戶時出錯:', error);
    message.value = '搜尋用戶時出錯';
    users.value = [];
  } finally {
    isLoading.value = false;
  }
};

const toggleDeleteUser = async (id, currentStatus) => {
  const action = currentStatus ? '恢復' : '刪除';
  if (confirm(`您確定要${action}這個用戶嗎？`)) {
    isLoading.value = true;
    try {
      const response = await axios.delete(`http://localhost:8080/myapp/admin/users/toggleDelete/${id}`);
      const data = response.data;
      if (data.success) {
        message.value = data.message;
        await searchUsers();
        await fetchTotalUsers();
      } else {
        message.value = data.message || `${action}失敗`;
      }
    } catch (error) {
      console.error(`${action}用戶時出錯:`, error);
      message.value = `${action}用戶時出錯`;
    } finally {
      isLoading.value = false;
    }
  }
};

const fetchTotalUsers = async () => {
  try {
    const response = await axios.get('http://localhost:8080/myapp/admin/users/count');
    const data = response.data;
    if (data.success) {
      totalUsers.value = data.count;
    } else {
      console.error('獲取用戶總數失敗');
    }
  } catch (error) {
    console.error('獲取用戶總數時出錯:', error);
  }
};

onMounted(() => {
  searchUsers();
  fetchTotalUsers();
});

const toggleSearchType = () => {
  searchType.value = searchType.value === 'username' ? 'email' : 'username';
  usernameSearch.value = '';
  emailSearch.value = '';
};

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
                        :disabled="isLoading"
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
                    <th>創建時間</th>
                    <th>狀態</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ new Date(user.createdat).toLocaleString() }}</td>
                    <td>{{ user.isdeleted ? '已刪除' : '正常' }}</td>
                    <td>
                      <argon-button 
                        :color="user.isdeleted ? 'success' : 'danger'" 
                        size="sm" 
                        @click="toggleDeleteUser(user.id, user.isdeleted)"
                      >
                        {{ user.isdeleted ? '恢復' : '刪除' }}
                      </argon-button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">沒有找到任何用戶。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>