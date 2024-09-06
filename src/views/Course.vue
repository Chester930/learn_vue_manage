<template>
  <main>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header pb-0">
              <h5 class="mb-0">課程管理</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-4">
                  <select v-model="searchType" class="form-select">
                    <option value="title">標題搜尋</option>
                    <option value="description">描述搜尋</option>
                    <option value="status-true">狀態: 啟用</option>
                    <option value="status-false">狀態: 停用</option>
                    <option value="category">類別</option>
                    <option value="creator">創建者 ID</option>
                    <option value="price-asc">價格: 升序</option>
                    <option value="price-desc">價格: 降序</option>
                    <option value="createdAt">創建時間</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <div v-if="searchType === 'createdAt'">
                    <ArgonInput 
                      id="startDate" 
                      type="datetime-local" 
                      placeholder="開始日期" 
                      v-model="startDate"
                    />
                    <ArgonInput 
                      id="endDate" 
                      type="datetime-local" 
                      placeholder="結束日期" 
                      v-model="endDate"
                    />
                  </div>
                  <div v-else-if="searchType === 'category'">
                    <select v-model="searchValue" class="form-select">
                      <option value="1">音樂</option>
                      <option value="2">語言</option>
                      <option value="3">程式</option>
                      <option value="4">攝影</option>
                      <option value="5">設計</option>
                      <option value="6">行銷</option>
                      <option value="7">投資理財</option>
                      <option value="8">運動</option>
                      <option value="9">烹飪</option>
                    </select>
                  </div>
                  <div v-else>
                    <ArgonInput 
                      type="text" 
                      placeholder="輸入搜尋值" 
                      v-model="searchValue"
                    />
                  </div>
                </div>
                <div class="col-md-2">
                  <ArgonButton 
                    color="primary" 
                    size="sm" 
                    @click="fetchCourses"
                    :disabled="isLoading"
                  >
                    搜尋
                  </ArgonButton>
                </div>
              </div>
              <p v-if="message" :class="{'text-success': message.includes('成功'), 'text-danger': !message.includes('成功')}">
                {{ message }}
              </p>
              <table class="table" v-if="courses.length > 0">
                <thead>
                  <tr>
                    <th>課程ID</th>
                    <th>名稱</th>
                    <th>創作者名稱</th>
                    <th>類別</th>
                    <th>課程封面</th>
                    <th>課程連結</th>
                    <th>上傳日期</th>
                    <th>價格</th>
                    <th>狀態</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="course in courses" :key="course.id">
                    <td>{{ course.id }}</td>
                    <td>{{ course.title }}</td>
                    <td>{{ course.creator.nickname }}</td> 
                    <td>{{ course.category.name }}</td> 
                    <td>
                      <img :src="course.photoUrl" alt="課程封面" width="100">
                    </td>
                    <td>{{ course.courseLink }}</td> 
                    <td>{{ formatDate(course.createdAt) }}</td> 
                    <td>{{ course.price }}</td>
                    <td>{{ course.status ? '啟用' : '停用' }}</td>
                    <td>
                      <ArgonButton 
                        :color="course.status ? 'danger' : 'success'" 
                        size="sm" 
                        @click="toggleCourseStatus(course.id)"
                      >
                        {{ course.status ? '停用' : '啟用' }}
                      </ArgonButton>
                      <ArgonButton 
                        color="primary" 
                        size="sm" 
                        @click="showCourseDetails(course)"
                      >
                        詳情
                      </ArgonButton>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">沒有找到任何課程。</p>
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
                  <ArgonButton 
                    color="primary" 
                    size="sm" 
                    @click="previousPage" 
                    :disabled="currentPage === 0"
                  >
                    上一頁
                  </ArgonButton>
                  <span class="mx-2">第 {{ currentPage + 1 }} 頁</span>
                  <ArgonButton 
                    color="primary" 
                    size="sm" 
                    @click="nextPage" 
                    :disabled="!hasNextPage"
                  >
                    下一頁
                  </ArgonButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳情視窗 -->
    <div v-if="showDetails" class="modal fade show" style="display: block;" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">課程詳情</h5>
            <button type="button" class="close" @click="showDetails = false">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div class="modal-body">
            <p><strong>課程 ID:</strong> {{ selectedCourse.id }}</p>
            <p><strong>課程名稱:</strong> {{ selectedCourse.title }}</p>
            <p><strong>創作者 ID:</strong> {{ selectedCourse.creator.id }}</p>
            <p><strong>創作者名稱:</strong> {{ selectedCourse.creator.nickname }}</p>
            <p><strong>課程概述:</strong> {{ selectedCourse.overview }}</p>
            <p><strong>課程描述:</strong> {{ selectedCourse.description }}</p>
            <p><strong>影片數量:</strong> {{ videoDetails.length }}</p>

            <!-- 影片詳情表格 -->
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>影片名稱</th>
                  <th>影片預覽</th>
                  <th>影片描述</th>
                  <th>影片時長</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="video in videoDetails" :key="video.id">
                  <td>
                    <a :href="video.url" target="_blank">{{ video.title }}</a>
                  </td>
                  <td>
                    <div class="video-preview">
                      <video 
                        :src="video.url"
                        controls
                        preload="metadata"
                        width="200"
                        :ref="getVideoRef" 
                        @mouseover="playPreview"
                        @mouseout="stopPreview"
                      >
                        您的瀏覽器不支持 HTML5 視頻。
                      </video>
                    </div>
                  </td>
                  <td>{{ video.description }}</td>
                  <td>{{ formatDuration(video.duration) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDetails = false">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue';
import axios from 'axios';
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";

export default {
  name: 'CourseManagement',
  components: {
    ArgonInput,
    ArgonButton
  },
  setup() {
    const courses = ref([]);
    const message = ref('');
    const isLoading = ref(false);
    const searchType = ref('title');
    const searchValue = ref('');
    const startDate = ref('');
    const endDate = ref('');

    const showDetails = ref(false);
    const selectedCourse = ref(null);
    const videoDetails = ref([]);
    const videoPreview = ref(null); 
    const videoRefs = ref({}); 

    const currentPage = ref(0);
    const pageSize = ref(10);
    const totalPages = ref(0);
    const hasNextPage = ref(false);

    const apiEndpoint = computed(() => {
      let endpoint = 'http://localhost:8080/myapp/admin/courses';
      let params = new URLSearchParams();

      switch (searchType.value) {
        case 'title':
          endpoint += '/search/title';
          params.append('title', searchValue.value);
          break;
        case 'description':
          endpoint += '/search/description';
          params.append('description', searchValue.value);
          break;
        case 'status-true':
          endpoint += '/status/true';
          break;
        case 'status-false':
          endpoint += '/status/false';
          break;
        case 'category':
          endpoint += `/category/${searchValue.value}`;
          break;
        case 'creator':
          endpoint += `/creator/${searchValue.value}`;
          break;
        case 'price-asc':
          endpoint += '/sort/price/asc';
          break;
        case 'price-desc':
          endpoint += '/sort/price/desc';
          break;
        case 'createdAt':
          endpoint += '/search/createdAt';
          params.append('startDate', formatDateForQuery(startDate.value));
          params.append('endDate', formatDateForQuery(endDate.value));
          break;
        default:
          // 使用默認端點
      }

      // 添加分頁參數
      params.append('page', currentPage.value.toString());
      params.append('size', pageSize.value.toString());

      return `${endpoint}?${params.toString()}`;
    });

    // 修改這個輔助函數來格式化日期
    const formatDateForQuery = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    const fetchCourses = async () => {
      isLoading.value = true;
      courses.value = [];
      selectedCourse.value = null;

      try {
        const response = await axios.get(apiEndpoint.value, {
          params: {
            page: currentPage.value,
            size: pageSize.value
          }
        });
        if (response.data) {
          courses.value = response.data.content;
          totalPages.value = response.data.totalPages;
          hasNextPage.value = !response.data.last;
          message.value = '';
        } else {
          message.value = '獲取課程列表時出錯';
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        message.value = '獲取課程列表時出錯';
      } finally {
        isLoading.value = false;
      }
    };

    const formatDuration = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      return [hours, minutes, remainingSeconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v, i) => v !== "00" || i > 0)
        .join(":");
    };
    const getVideoRef = (el) => {
      if (el) {
        videoRefs.value[el.id] = el; // Assign the ref using a unique ID
      }
    };

    const playPreview = (event) => {
      const videoId = event.target.id; // Get the ID of the video
      nextTick().then(() => {
        if (videoRefs.value[videoId]) {
          videoRefs.value[videoId].play().then(() => {
            console.log("Video playback started");
          }).catch(error => {
            console.error("Video playback interrupted:", error);
          });
        }
      });
    };

    const loadVideo = (videoLink) => {
      if (videoPreview.value) { 
        videoPreview.value.src = videoLink;
      }
    };

    const stopPreview = (event) => {
      const videoId = event.target.id;
      if (videoRefs.value[videoId]) {
        videoRefs.value[videoId].pause();
        videoRefs.value[videoId].currentTime = 0;
      }
    };
    const toggleCourseStatus = async (id) => {
      isLoading.value = true;
      try {
        const response = await axios.put(`http://localhost:8080/myapp/admin/courses/${id}/status`);

        if (response.data.success) {
          message.value = '課程狀態已更新';
          await fetchCourses(); 
        } else {
          message.value = '更新課程狀態失敗';
        }
      } catch (error) {
        console.error('Error toggling course status:', error);
        message.value = '更改課程狀態時出錯';
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('zh-TW', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    };

    const fetchVideoDetails = async (courseId) => {
      try {
        const response = await axios.get(`http://localhost:8080/myapp/admin/courses/${courseId}/videos`);
        if (response.data) {
          videoDetails.value = response.data;
        } else {
          console.error('Failed to fetch video details');
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
      }
    };

    const showCourseDetails = async (course) => {
      selectedCourse.value = course;
      showDetails.value = true;
      await fetchVideoDetails(course.id);
    };

    const changePageSize = () => {
      currentPage.value = 0;
      fetchCourses();
    };

    const previousPage = () => {
      if (currentPage.value > 0) {
        currentPage.value--;
        fetchCourses();
      }
    };

    const nextPage = () => {
      if (hasNextPage.value) {
        currentPage.value++;
        fetchCourses();
      }
    };

    onMounted(() => {
      fetchCourses();
    });

    return {
      courses,
      message,
      isLoading,
      searchType,
      searchValue,
      startDate,
      endDate,
      showDetails,
      selectedCourse,
      videoDetails,
      fetchCourses,
      toggleCourseStatus,
      formatDate,
      showCourseDetails,
      formatDuration,
      playPreview,
      stopPreview,
      getVideoRef,
      loadVideo,
      videoPreview,
      currentPage,
      pageSize,
      totalPages,
      hasNextPage,
      changePageSize,
      previousPage,
      nextPage,
      formatDateForQuery,
      apiEndpoint
    };
  }
};
</script>

<style scoped>

.modal-dialog {
  max-width: 50%;
}
.video-preview {
  width: 200px;
  height: 112px; /* 16:9 比例 */
  overflow: hidden;
}

.video-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

</style>