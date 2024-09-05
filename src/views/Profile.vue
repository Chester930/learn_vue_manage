<script setup>
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

// 通用狀態
const users = ref([]);
const totalUsers = ref(0);
const message = ref('');
const isLoading = ref(false);
const currentPage = ref(0);
const pageSize = ref(10);
const totalPages = ref(0);
const hasNextPage = ref(false);
const isActiveSearch = ref(true);

// 活躍用戶搜索狀態
const activeSearchType = ref('username');
const activeUsernameSearch = ref('');
const activeEmailSearch = ref('');
const activeStartDate = ref('');
const activeEndDate = ref('');

// 已刪除用戶搜索狀態
const deletedSearchType = ref('username');
const deletedUsernameSearch = ref('');
const deletedEmailSearch = ref('');
const deletedStartDate = ref('');
const deletedEndDate = ref('');

const isSearchInputEmpty = computed(() => {
  if (isActiveSearch.value) {
    switch (activeSearchType.value) {
      case 'username':
        return !activeUsernameSearch.value;
      case 'email':
        return !activeEmailSearch.value;
      case 'creationTime':
        return !(activeStartDate.value && activeEndDate.value);
    }
  } else {
    switch (deletedSearchType.value) {
      case 'username':
        return !deletedUsernameSearch.value;
      case 'email':
        return !deletedEmailSearch.value;
      case 'creationTime':
        return !(deletedStartDate.value && deletedEndDate.value);
    }
  }
  return true;
});

const searchUsers = async () => {
  isLoading.value = true;
  message.value = '';
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      isDeleted: !isActiveSearch.value
    };
    let endpoint = 'http://localhost:8080/myapp/admin/users/all';

    if (isActiveSearch.value) {
      switch (activeSearchType.value) {
        case 'username':
          if (activeUsernameSearch.value) {
            endpoint = 'http://localhost:8080/myapp/admin/users/search/username';
            params.username = activeUsernameSearch.value;
          }
          break;
        case 'email':
          if (activeEmailSearch.value) {
            endpoint = 'http://localhost:8080/myapp/admin/users/search/email';
            params.email = activeEmailSearch.value;
          }
          break;
        case 'creationTime':
          if (activeStartDate.value && activeEndDate.value) {
            endpoint = 'http://localhost:8080/myapp/admin/users/search/creationTime';
            params.startDate = activeStartDate.value;
            params.endDate = activeEndDate.value;
          }
          break;
      }
    } else {
      switch (deletedSearchType.value) {
        case 'username':
          if (deletedUsernameSearch.value) {
            endpoint = 'http://localhost:8080/myapp/admin/users/search/usernameX';
            params.username = deletedUsernameSearch.value;
          }
          break;
        case 'email':
          if (deletedEmailSearch.value) {
            endpoint = 'http://localhost:8080/myapp/admin/users/search/emailX';
            params.email = deletedEmailSearch.value;
          }
          break;
        case 'creationTime':
          if (deletedStartDate.value && deletedEndDate.value) {
            endpoint = 'http://localhost:8080/myapp/admin/users/search/creationTimeX';
            params.startDate = deletedStartDate.value;
            params.endDate = deletedEndDate.value;
          }
          break;
      }
    }

    const response = await axios.get(endpoint, { params });
    const data = response.data;
    if (data.success) {
      users.value = data.users;
      currentPage.value = data.currentPage;
      totalPages.value = data.totalPages;
      hasNextPage.value = currentPage.value < totalPages.value - 1;
      totalUsers.value = data.totalItems;
      if (users.value.length === 0) {
        message.value = '沒有找到匹配的用戶';
      }
    } else {
      users.value = [];
      message.value = data.message || '搜索失敗';
    }
  } catch (error) {
    console.error('搜索用戶時出錯:', error);
    message.value = '搜索用戶時出錯';
    users.value = [];
  } finally {
    isLoading.value = false;
  }
};

const toggleDeleteUser = async (id, currentStatus) => {
  const action = currentStatus ? '恢復' : '刪除';
  const result = await Swal.fire({
    title: '確認操作',
    text: `您確定要${action}這個用戶嗎？`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '確定',
    cancelButtonText: '取消'
  });

  if (result.isConfirmed) {
    isLoading.value = true;
    try {
      const response = await axios.delete(`http://localhost:8080/myapp/admin/users/toggleDelete/${id}`);
      const data = response.data;
      if (data.success) {
        Swal.fire('成功', data.message, 'success');
        await searchUsers();
        await fetchTotalUsers();
      } else {
        Swal.fire('失敗', data.message || `${action}失敗`, 'error');
      }
    } catch (error) {
      console.error(`${action}用戶時出錯:`, error);
      Swal.fire('錯誤', `${action}用戶時出錯`, 'error');
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

watch(isActiveSearch, () => {
  currentPage.value = 0;
  // 重置所有搜索字段
  activeUsernameSearch.value = '';
  activeEmailSearch.value = '';
  activeStartDate.value = '';
  activeEndDate.value = '';
  deletedUsernameSearch.value = '';
  deletedEmailSearch.value = '';
  deletedStartDate.value = '';
  deletedEndDate.value = '';
  searchUsers();
});

const handleSearch = () => {
  currentPage.value = 0;
  searchUsers();
};

const changePageSize = () => {
  currentPage.value = 0;
  searchUsers();
};

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    searchUsers();
  }
};

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
    searchUsers();
  }
};
</script>

<template>
  <main>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header pb-0">
              <h5 class="mb-0">用戶搜索</h5>
              <div class="d-flex align-items-center">
                <argon-button 
                  color="secondary" 
                  size="sm" 
                  @click="isActiveSearch = !isActiveSearch"
                >
                  {{ isActiveSearch ? '切換到已刪除會員' : '切換到一般會員' }}
                </argon-button>
                
                <div class="button-group ml-3">
                  <div v-if="isActiveSearch">
                    <argon-button color="info" size="sm" @click="activeSearchType = 'username'" :class="{ active: activeSearchType === 'username' }">
                      名稱搜索
                    </argon-button>
                    <argon-button color="info" size="sm" @click="activeSearchType = 'email'" :class="{ active: activeSearchType === 'email' }">
                      Email搜索
                    </argon-button>
                    <argon-button color="info" size="sm" @click="activeSearchType = 'creationTime'" :class="{ active: activeSearchType === 'creationTime' }">
                      創建時間搜索
                    </argon-button>
                  </div>
                  <div v-else>
                    <argon-button color="info" size="sm" @click="deletedSearchType = 'username'" :class="{ active: deletedSearchType === 'username' }">
                      名稱搜索
                    </argon-button>
                    <argon-button color="info" size="sm" @click="deletedSearchType = 'email'" :class="{ active: deletedSearchType === 'email' }">
                      Email搜索
                    </argon-button>
                    <argon-button color="info" size="sm" @click="deletedSearchType = 'creationTime'" :class="{ active: deletedSearchType === 'creationTime' }">
                      創建時間搜索
                    </argon-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-12">
                  <div class="input-group">
                    <template v-if="isActiveSearch">
                      <div v-if="activeSearchType === 'username'">
                        <argon-input id="active-username-search" type="text" placeholder="輸入名稱" v-model="activeUsernameSearch" />
                      </div>
                      <div v-else-if="activeSearchType === 'email'">
                        <argon-input id="active-email-search" type="email" placeholder="輸入電子郵件" v-model="activeEmailSearch" />
                      </div>
                      <div v-else-if="activeSearchType === 'creationTime'">
                        <argon-input id="active-start-date" type="datetime-local" placeholder="開始日期" v-model="activeStartDate" />
                        <argon-input id="active-end-date" type="datetime-local" placeholder="結束日期" v-model="activeEndDate" />
                      </div>
                    </template>
                    <template v-else>
                      <div v-if="deletedSearchType === 'username'">
                        <argon-input id="deleted-username-search" type="text" placeholder="輸入名稱" v-model="deletedUsernameSearch" />
                      </div>
                      <div v-else-if="deletedSearchType === 'email'">
                        <argon-input id="deleted-email-search" type="email" placeholder="輸入電子郵件" v-model="deletedEmailSearch" />
                      </div>
                      <div v-else-if="deletedSearchType === 'creationTime'">
                        <argon-input id="deleted-start-date" type="datetime-local" placeholder="開始日期" v-model="deletedStartDate" />
                        <argon-input id="deleted-end-date" type="datetime-local" placeholder="結束日期" v-model="deletedEndDate" />
                      </div>
                    </template>
                    <div class="input-group-append">
                      <argon-button
                        color="primary"
                        size="sm"
                        @click="handleSearch"
                        :disabled="isLoading || isSearchInputEmpty"
                      >
                        搜索
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
              <p v-if="message" :class="{'text-success': message.includes('成功'), 'text-danger': !message.includes('成功')}">
                {{ message }}
              </p>
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
                    <td>{{ new Date(user.createdAt).toLocaleString() }}</td> 
                    <td>{{ user.deleted ? '已刪除' : '正常' }}</td> 
                    <td>
                      <argon-button 
                        :color="user.deleted ? 'success' : 'danger'" 
                        size="sm" 
                        @click="toggleDeleteUser(user.id, user.deleted)" 
                      >
                        {{ user.deleted ? '恢復' : '刪除' }}
                      </argon-button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">沒有找到任何用戶。</p>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div>
                  每頁顯示：
                  <select v-model="pageSize" @change="changePageSize">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div>
                  <argon-button 
                    color="primary" 
                    size="sm" 
                    @click="previousPage" 
                    :disabled="currentPage === 0"
                  >
                    上一頁
                  </argon-button>
                  <span class="mx-2">第 {{ currentPage + 1 }} 頁</span>
                  <argon-button 
                    color="primary" 
                    size="sm" 
                    @click="nextPage" 
                    :disabled="!hasNextPage"
                  >
                    下一頁
                  </argon-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>