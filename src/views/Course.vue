vue
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
                <div class="col-md-6">
                  <ArgonInput 
                    type="text" 
                    placeholder="輸入課程名稱" 
                    v-model="searchTitle"
                  />
                </div>
                <div class="col-md-2">
                  <select v-model="searchType" class="form-select">
                    <option value="all">所有課程</option>
                    <option value="title">標題搜尋</option>
                    <option value="description">描述搜尋</option>
                    <!-- 可以根據需要添加更多篩選條件 -->
                  </select>
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
                    <th>ID</th>
                    <th>名稱</th>
                    <th>創作者名稱</th>
                    <th>類別</th>
                    <th>課程封面</th>
                    <th>課程連結</th>
                    <th>上傳日期</th>
                    <th>價格</th>
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
                    <td>
                      <ArgonButton 
                        color="success" 
                        size="sm" 
                        @click="approveCourse(course.id)"
                        v-if="!course.status" 
                      >
                        通過
                      </ArgonButton>
                      <ArgonButton 
                        color="warning" 
                        size="sm" 
                        @click="toggleCourseStatus(course.id)"
                      >
                        {{ course.status ? '停用' : '啟用' }}
                      </ArgonButton>
                      <ArgonButton 
                        color="danger" 
                        size="sm" 
                        @click="deleteCourse(course.id)"
                      >
                        刪除
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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";

const courses = ref([]);
const message = ref('');
const isLoading = ref(false);
const searchTitle = ref(''); 
const searchType = ref('all'); // 預設搜尋所有課程

const showDetails = ref(false); 
const selectedCourse = ref(null); 

const fetchCourses = async () => {
  isLoading.value = true;
  courses.value = [];
  selectedCourse.value = null;

  try {
    let response;
    if (searchType.value === 'all') {
      response = await axios.get('http://localhost:8080/myapp/admin/courses'); 
    } else if (searchType.value === 'title') {
      response = await axios.get(`http://localhost:8080/myapp/admin/courses/search/title?title=${searchTitle.value}`);
    } else if (searchType.value === 'description') {
      response = await axios.get(`http://localhost:8080/myapp/admin/courses/search/description?description=${searchTitle.value}`); 
    } 
    
    if (response.data.success) {
        // 根據你的後端 API 結構调整
        courses.value = response.data.courses || response.data.content; 
        message.value = '';
    } else {
        message.value = response.data.message || '獲取課程列表時出錯';
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
    const course = courses.value.find(c => c.id === id);
    const newStatus = !course.status;
    // 根據你的後端 API 結構調整
    const response = await axios.put(`http://localhost:8080/myapp/admin/courses/${id}/status`, { status: newStatus }); 

    if (response.data.success) {
      message.value = response.data.message;
      await fetchCourses();
    } else {
      message.value = response.data.message;
    }
  } catch (error) {
    console.error('Error toggling course status:', error);
    message.value = '更改課程狀態時出錯';
  } finally {
    isLoading.value = false;
  }
};

const deleteCourse = async (id) => {
  if (confirm('確定要刪除這門課程嗎？')) {
    isLoading.value = true;
    try {
      const response = await axios.delete(`http://localhost:8080/myapp/admin/courses/${id}`);
      if (response.data.success) {
        message.value = response.data.message;
        await fetchCourses(); 
      } else {
        message.value = response.data.message;
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      message.value = '刪除課程時出錯';
    } finally {
      isLoading.value = false;
    }
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(); 
};

const approveCourse = async (id) => {
  isLoading.value = true;
  try {
    // 根據你的後端 API 結構調整
    const response = await axios.put(`http://localhost:8080/myapp/admin/courses/${id}/status`, { status: true });

    if (response.data.success) {
      message.value = response.data.message;
      await fetchCourses(); 
    } else {
      message.value = response.data.message;
    }
  } catch (error) {
    console.error('Error approving course:', error);
    message.value = '通過課程時出錯';
  } finally {
    isLoading.value = false;
  }
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