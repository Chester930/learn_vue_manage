vue
<template>
  <main>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header pb-0">
              <h5 class="mb-0">創作者管理</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <!-- ID 搜尋 -->
                <div class="col-md-6 mb-2">
                  <argon-input 
                    type="text" 
                    placeholder="輸入創作者 ID" 
                    v-model="searchId"
                  />
                  <argon-button 
                    color="primary" 
                    size="sm" 
                    @click="fetchCreatorById"
                    :disabled="isLoading"
                  >
                    搜尋 ID
                  </argon-button>
                </div>

                <!-- 暱稱搜尋 -->
                <div class="col-md-6 mb-2">
                  <argon-input 
                    type="text" 
                    placeholder="輸入創作者暱稱" 
                    v-model="searchNickname"
                  />
                  <select v-model="searchType" class="form-select d-inline-block" style="width: auto; margin-right: 10px;">
                    <option value="approved">已通過審核</option>
                    <option value="unapproved">未通過審核</option>
                  </select>
                  <argon-button 
                    color="primary" 
                    size="sm" 
                    @click="fetchCreatorsByNickname"
                    :disabled="isLoading"
                  >
                    搜尋 暱稱
                  </argon-button>
                </div>
              </div>
              <p v-if="message" :class="{'text-success': message.includes('成功'), 'text-danger': !message.includes('成功')}">
                {{ message }}
              </p>
              <table class="table" v-if="creators.length > 0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>暱稱</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="creator in creators" :key="creator.id">
                    <td>{{ creator.id }}</td>
                    <td>{{ creator.nickname }}</td>
                    <td>
                      <argon-button 
                        color="primary" 
                        size="sm" 
                        @click="showCreatorDetails(creator)"
                      >
                        查看詳情
                      </argon-button>
                      <argon-button 
                        :color="creator.status ? 'danger' : 'success'" 
                        size="sm" 
                        @click="toggleCreatorStatus(creator.id, creator.status)"
                      >
                        {{ creator.status ? '停用' : '啟用' }}
                      </argon-button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">沒有找到任何創作者。</p>
              <!-- 分頁控制 -->
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
    <!-- 詳情視窗 -->
    <div v-if="showDetails" class="modal fade show" style="display: block;" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">創作者詳情</h5>
            <button type="button" class="close" @click="showDetails = false">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p><strong>自我介紹:</strong> {{ selectedCreator.selfIntro }}</p>
            <p><strong>工作經驗:</strong> {{ selectedCreator.jobExperience }}</p>
            <p><strong>學歷資格:</strong> {{ selectedCreator.eduQuali }}</p>
            <p>
              <strong>網站:</strong>
              <argon-button v-if="selectedCreator.website" @click="openLink(selectedCreator.website)">
                打開網站
              </argon-button>
            </p>
            <p>
              <strong>Facebook:</strong>
              <argon-button v-if="selectedCreator.fbLink" @click="openLink(selectedCreator.fbLink)">
                打開 Facebook
              </argon-button>
            </p>
            <p>
              <strong>Instagram:</strong>
              <argon-button v-if="selectedCreator.igLink" @click="openLink(selectedCreator.igLink)">
                打開 Instagram
              </argon-button>
            </p>
            <p>
              <strong>YouTube:</strong>
              <argon-button v-if="selectedCreator.ytLink" @click="openLink(selectedCreator.ytLink)">
                打開 YouTube
              </argon-button>
            </p>
            <p><strong>創建時間:</strong> {{ selectedCreator.createdAt }}</p>
            <p><strong>用戶名:</strong> {{ selectedCreator.user.username }}</p>
            <p><strong>用戶郵件:</strong> {{ selectedCreator.user.email }}</p>
          </div>
          <div class="modal-footer">
            <argon-button type="button" color="secondary" @click="showDetails = false">關閉</argon-button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";

const searchId = ref(''); // 搜尋 ID 的變數
const searchNickname = ref(''); // 搜尋暱稱的變數
const searchType = ref('approved'); // 預設搜尋類型
const creators = ref([]);
const message = ref('');
const isLoading = ref(false);
const showDetails = ref(false); // 控制是否顯示詳情視窗
const selectedCreator = ref(null); // 儲存選中的創作者
const currentPage = ref(0); // 當前頁碼
const totalPages = ref(0); // 總頁數
const pageSize = ref(10); // 每頁顯示的創作者數量
const hasNextPage = ref(false); // 是否有下一頁

const fetchCreatorById = async () => {
  isLoading.value = true;
  creators.value = []; // 清空搜索结果
  selectedCreator.value = null; // 重置选中的創作者
  try {
    const response = await axios.get(`http://localhost:8080/myapp/admin/creators/${searchId.value}`);
    if (response.data.success) {
      creators.value = [response.data.creator]; // 只返回一個創作者
      totalPages.value = 1; // 只有一頁
      message.value = '';
    } else {
      message.value = response.data.message;
    }
  } catch (error) {
    console.error('Error fetching creator by ID:', error);
    message.value = '獲取創作者時出錯';
  } finally {
    isLoading.value = false;
  }
};

const fetchCreatorsByNickname = async () => {
  isLoading.value = true;
  creators.value = []; // 清空搜索结果
  selectedCreator.value = null; // 重置选中的創作者
  try {
    let response;
    if (searchNickname.value.trim() === '') {
      // 如果暱稱為空，根據狀態搜尋創作者
      response = await axios.get(`http://localhost:8080/myapp/admin/creators/${searchType.value}?page=${currentPage.value}&size=${pageSize.value}`);
    } else {
      // 根據暱稱模糊搜尋創作者
      response = await axios.get(`http://localhost:8080/myapp/admin/creators/${searchType.value}/search?nickname=${searchNickname.value}&page=${currentPage.value}&size=${pageSize.value}`);
    }

    if (response.data.success) {
      creators.value = response.data.creators; // 更新創作者列表
      totalPages.value = Math.ceil(response.data.total / pageSize.value); // 計算總頁數
      hasNextPage.value = currentPage.value < totalPages.value - 1; // 是否有下一頁
      message.value = '';
    } else {
      message.value = response.data.message;
    }
  } catch (error) {
    console.error('Error fetching creators by nickname:', error);
    message.value = '獲取創作者列表時出錯';
  } finally {
    isLoading.value = false;
  }
};

const toggleCreatorStatus = async (id) => {
  isLoading.value = true;
  try {
    const response = await axios.put(`http://localhost:8080/myapp/admin/creators/${id}/status`, null, {
      params: { status: true }
    });
    if (response.data.success) {
      message.value = response.data.message;
      await fetchCreatorsByNickname(); // 更新創作者列表
    } else {
      message.value = response.data.message;
    }
  } catch (error) {
    console.error('Error toggling creator status:', error);
    message.value = '更改創作者狀態時出錯';
  } finally {
    isLoading.value = false;
  }
};

const showCreatorDetails = (creator) => {
  selectedCreator.value = creator;
  showDetails.value = true;
};

const openLink = (url) => {
  window.open(url, '_blank');
};

const changePageSize = () => {
  currentPage.value = 0;
  fetchCreatorsByNickname();
};

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchCreatorsByNickname();
  }
};

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
    fetchCreatorsByNickname();
  }
};

onMounted(() => {
  fetchCreatorsByNickname(); // 初始化時獲取創作者列表
});
</script>

<style scoped>
/* 這裡可以添加 CSS 樣式以美化你的視窗 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>