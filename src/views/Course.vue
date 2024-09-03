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
                    <option value="category">類別 </option>
                    <option value="creator">創建者 ID</option>
                    <option value="price-asc">價格: 升序</option>
                    <option value="price-desc">價格: 降序</option>
                    <option value="createdAt">創建時間</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <div v-if="searchType === 'createdAt'">
                    <label for="startDate">起始日期:</label>
                    <input type="date" id="startDate" v-model="startDate">
                    <label for="endDate">結束日期:</label>
                    <input type="date" id="endDate" v-model="endDate">
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
                        color="warning" 
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
            <!-- ... 其他課程資訊 ... -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDetails = false">關閉</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";

const courses = ref([]);
const message = ref('');
const isLoading = ref(false);
const searchType = ref('title'); // 預設搜尋類型為標題搜尋
const searchValue = ref('');
const startDate = ref('');
const endDate = ref('');

const showDetails = ref(false); 
const selectedCourse = ref(null); 

const apiEndpoint = computed(() => {
  switch (searchType.value) {
    case 'title':
      return `http://localhost:8080/myapp/admin/courses/search/title?title=${searchValue.value}`;
    case 'description':
      return `http://localhost:8080/myapp/admin/courses/search/description?description=${searchValue.value}`;
    case 'status-true':
      return `http://localhost:8080/myapp/admin/courses/status/true`;
    case 'status-false':
      return `http://localhost:8080/myapp/admin/courses/status/false`;
    case 'category':
      return `http://localhost:8080/myapp/admin/courses/category/${searchValue.value}`;
    case 'creator':
      return `http://localhost:8080/myapp/admin/courses/creator/${searchValue.value}`;
    case 'price-asc':
      return 'http://localhost:8080/myapp/admin/courses/sort/price/asc';
    case 'price-desc':
      return 'http://localhost:8080/myapp/admin/courses/sort/price/desc';
    case 'createdAt':
      return `http://localhost:8080/myapp/admin/courses/search/createdAt?startDate=${startDate.value}&endDate=${endDate.value}`;
    default:
      return 'http://localhost:8080/myapp/admin/courses';
  }
});

const fetchCourses = async () => {
  isLoading.value = true;
  courses.value = [];
  selectedCourse.value = null;

  try {
    const response = await axios.get(apiEndpoint.value);
    if (response.data) {
        courses.value = response.data.content;
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

const toggleCourseStatus = async (id) => {
  isLoading.value = true;
  try {
    const response = await axios.put(`http://localhost:8080/myapp/admin/courses/${id}/status`);

    if (response.data.success) {
      message.value = '課程狀態已更新';
      await fetchCourses(); // 重新獲取課程列表以顯示更新後的狀態
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
  return date.toLocaleDateString(); 
};

const showCourseDetails = (course) => {
  selectedCourse.value = course;
  showDetails.value = true;
};

onMounted(() => {
  fetchCourses(); 
});
</script>

<style scoped>
/* 這裡可以添加 CSS 樣式以美化你的視窗 */
</style>