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
                <div class="col-md-6">
                  <argon-input 
                    type="text" 
                    placeholder="輸入創作者暱稱" 
                    v-model="searchNickname"
                  />
                </div>
                <div class="col-md-2">
                  <select v-model="searchType" class="form-select">
                    <option value="approved">已通過審核</option>
                    <option value="unapproved">未通過審核</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <argon-button 
                    color="primary" 
                    size="sm" 
                    @click="fetchCreators"
                    :disabled="isLoading"
                  >
                    搜尋
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

              <!-- 分頁按鈕 -->
              <div class="pagination">
                <argon-button 
                  :disabled="currentPage === 0" 
                  @click="changePage(currentPage - 1)"
                >
                  上一頁
                </argon-button>
                <span>第 {{ currentPage + 1 }} 頁 / {{ totalPages }} 頁</span>
                <argon-button 
                  :disabled="currentPage >= totalPages - 1" 
                  @click="changePage(currentPage + 1)"
                >
                  下一頁
                </argon-button>
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

const creators = ref([]);
const message = ref('');
const isLoading = ref(false);
const searchNickname = ref('');
const searchType = ref('approved'); // 預設搜尋類型
const showDetails = ref(false); // 控制是否顯示詳情視窗
const selectedCreator = ref(null); // 儲存選中的創作者
const currentPage = ref(0); // 當前頁碼
const totalPages = ref(0); // 總頁數

const fetchCreators = async () => {
  isLoading.value = true;
  creators.value = []; // 清空搜索结果
  selectedCreator.value = null; // 重置选中的創作者
  try {
    let response;
    const pageSize = 10; // 每頁顯示的創作者數量
    if (searchNickname.value.trim() === '') {
      // 根據選擇的狀態搜尋創作者
      if (searchType.value === 'approved') {
        response = await axios.get(`http://localhost:8080/myapp/admin/creators/approved?page=${currentPage.value}&size=${pageSize}`);
      } else {
        response = await axios.get(`http://localhost:8080/myapp/admin/creators/unapproved?page=${currentPage.value}&size=${pageSize}`);
      }
    } else {
      // 根據暱稱模糊搜尋創作者
      if (searchType.value === 'approved') {
        response = await axios.get(`http://localhost:8080/myapp/admin/creators/approved/search?nickname=${searchNickname.value}&page=${currentPage.value}&size=${pageSize}`);
      } else {
        response = await axios.get(`http://localhost:8080/myapp/admin/creators/unapproved/search?nickname=${searchNickname.value}&page=${currentPage.value}&size=${pageSize}`);
      }
    }
    if (response.data.success) {
      creators.value = response.data.creators || response.data; // 根據返回的數據結構設置創作者列表
      totalPages.value = response.data.totalPages; // 更新總頁數
      message.value = '';
    } else {
      message.value = response.data.message;
    }
  } catch (error) {
    console.error('Error fetching creators:', error);
    message.value = '獲取創作者列表時出錯';
  } finally {
    isLoading.value = false;
  }
};

const changePage = (newPage) => {
  if (newPage >= 0 && newPage < totalPages.value) {
    currentPage.value = newPage;
    fetchCreators(); // 重新獲取創作者列表
  }
};

const toggleCreatorStatus = async (id) => {
  isLoading.value = true;
  try {
    // 強制將狀態設置為已通過審核 (true)
    const response = await axios.put(`http://localhost:8080/myapp/admin/creators/${id}/status`, null, {
      params: { status: true }
    });
    if (response.data.success) {
      message.value = response.data.message;
      await fetchCreators(); // 更新創作者列表
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

onMounted(() => {
  fetchCreators(); // 初始化時獲取創作者列表
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