<template>
  <main>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header pb-0">
              <h5 class="mb-0">交易管理</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-4">
                  <select v-model="searchType" class="form-control">
                    <option value="transactionId">交易ID</option>
                    <option value="courseId">課程ID</option>
                    <option value="courseName">課程名稱</option>
                    <option value="buyerId">購買者ID</option>
                    <option value="buyerName">購買者名稱</option>
                    <option value="creatorId">創作者ID</option>
                    <option value="creatorName">創作者名稱</option>
                    <option value="dateRange">日期範圍</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <template v-if="searchType === 'dateRange'">
                    <div class="d-flex">
                      <ArgonInput 
                        type="datetime-local" 
                        placeholder="開始日期" 
                        v-model="searchStartDate"
                        class="mr-2"
                      />
                      <ArgonInput 
                        type="datetime-local" 
                        placeholder="結束日期" 
                        v-model="searchEndDate"
                      />
                    </div>
                  </template>
                  <ArgonInput 
                    v-else
                    type="text" 
                    :placeholder="getPlaceholder()"
                    v-model="searchValue"
                  />
                </div>
                <div class="col-md-2">
                  <ArgonButton 
                    color="primary" 
                    size="sm" 
                    @click="fetchTransactions"
                    :disabled="isLoading"
                  >
                    搜尋
                  </ArgonButton>
                  <ArgonButton 
                    color="secondary" 
                    size="sm" 
                    @click="resetSearch"
                    :disabled="isLoading"
                    class="ml-2"
                  >
                    重置
                  </ArgonButton>
                </div>
              </div>
              <p v-if="message" :class="{'text-success': message.includes('成功'), 'text-danger': !message.includes('成功')}">
                {{ message }}
              </p>
              <table class="table" v-if="transactions.length > 0">
                <thead>
                  <tr>
                    <!-- <th>交易ID</th> -->
                    <th>購買者</th>
                    <th>購買者Email</th>
                    <th>課程ID</th>
                    <th>課程名稱</th>
                    <th>創作者</th>
                    <th>付款金額</th>
                    <!-- <th>購買時間</th> -->
                    <th>付款方式</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="transaction in transactions" :key="transaction.id">
                    <!-- <td>{{ transaction.transactionId }}</td> -->
                    <td>{{ transaction.buyer.username }}</td>
                    <td>{{ transaction.buyer.email }}</td>
                    <td>{{ transaction.orderItems[0].course.id }}</td>
                    <td>{{ transaction.orderItems[0].courseName }}</td>
                    <td>{{ transaction.orderItems[0].course.creator.nickname }}</td>
                    <td>{{ transaction.totalPrice }}</td>
                    <!-- <td>{{ formatDate(transaction.createdAt) }}</td> -->
                    <td>{{ transaction.paymentMethod }}</td>
                    <td>
                      <ArgonButton 
                        color="info" 
                        size="sm" 
                        @click="showTransactionDetails(transaction)"
                      >
                        詳情
                      </ArgonButton>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">沒有找到任何交易。</p>
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
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">交易詳情</h5>
            <button type="button" class="close" @click="showDetails = false">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p><strong>交易ID:</strong> {{ selectedTransaction.transactionId }}</p>
            <p><strong>購買者:</strong> {{ selectedTransaction.buyer.username }}</p>
            <p><strong>購買者Email:</strong> {{ selectedTransaction.buyer.email }}</p>
            <p><strong>課程名稱:</strong> {{ selectedTransaction.orderItems[0].courseName }}</p>
            <p><strong>課程ID:</strong> {{ selectedTransaction.orderItems[0].course.id }}</p>
            <p><strong>創作者:</strong> {{ selectedTransaction.orderItems[0].course.creator.nickname }}</p>
            <p><strong>付款金額:</strong> {{ selectedTransaction.totalPrice }}</p>
            <p><strong>購買時間:</strong> {{ formatDate(selectedTransaction.createdAt) }}</p>
            <p><strong>付款方式:</strong> {{ selectedTransaction.paymentMethod }}</p>
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
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonButton from "@/components/ArgonButton.vue";

const transactions = ref([]);
const message = ref('');
const isLoading = ref(false);
const searchType = ref('transactionId');
const searchValue = ref('');
const searchStartDate = ref('');
const searchEndDate = ref('');
const showDetails = ref(false);
const selectedTransaction = ref(null);
const currentPage = ref(0);
const pageSize = ref(10);
const totalPages = ref(0);
const hasNextPage = ref(false);

const getPlaceholder = () => {
  switch (searchType.value) {
    case 'transactionId': return '輸入交易ID';
    case 'courseId': return '輸入課程ID';
    case 'courseName': return '輸入課程名稱';
    case 'buyerId': return '輸入購買者ID';
    case 'buyerName': return '輸入購買者名稱';
    case 'creatorId': return '輸入創作者ID';
    case 'creatorName': return '輸入創作者名稱';
    default: return '輸入搜尋內容';
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

const fetchTransactions = async () => {
  isLoading.value = true;
  transactions.value = [];
  selectedTransaction.value = null;
  try {
    let url = 'http://localhost:8080/myapp/admin/order/allDesc';
    let params = {
      page: currentPage.value,
      size: pageSize.value,
    };

    if (searchValue.value || (searchType.value === 'dateRange' && searchStartDate.value && searchEndDate.value)) {
      switch (searchType.value) {
        case 'transactionId':
          url = `http://localhost:8080/myapp/admin/order/transaction/${searchValue.value}`;
          break;
        case 'courseId':
          url = `http://localhost:8080/myapp/admin/order/course/${searchValue.value}`;
          break;
        case 'courseName':
          url = `http://localhost:8080/myapp/admin/order/courseName`;
          params.courseName = searchValue.value;
          break;
        case 'buyerId':
          url = `http://localhost:8080/myapp/admin/order/buyer/${searchValue.value}`;
          break;
        case 'buyerName':
          url = `http://localhost:8080/myapp/admin/order/buyerName`;
          params.buyerName = searchValue.value;
          break;
        case 'creatorId':
          url = `http://localhost:8080/myapp/admin/order/creator/${searchValue.value}`;
          break;
        case 'dateRange':
          url = `http://localhost:8080/myapp/admin/order/dateRange`;
          params.startDate = searchStartDate.value;
          params.endDate = searchEndDate.value;
          break;
      }
    }

    const response = await axios.get(url, { params });
    
    if (response.data.content) {
      transactions.value = response.data.content;
      totalPages.value = response.data.totalPages;
      hasNextPage.value = !response.data.last;
    } else if (Array.isArray(response.data)) {
      transactions.value = response.data;
    } else if (response.data) {
      transactions.value = [response.data];
    }
    message.value = '';
  } catch (error) {
    console.error('Error fetching transactions:', error);
    message.value = '獲取交易列表時出錯: ' + (error.response?.data?.message || error.message);
  } finally {
    isLoading.value = false;
  }
};

const resetSearch = () => {
  searchType.value = 'transactionId';
  searchValue.value = '';
  searchStartDate.value = '';
  searchEndDate.value = '';
  currentPage.value = 0;
  fetchTransactions();
};

const showTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction;
  showDetails.value = true;
};

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchTransactions();
  }
};

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
    fetchTransactions();
  }
};

const changePageSize = () => {
  currentPage.value = 0;
  fetchTransactions();
};

watch([searchType], () => {
  searchValue.value = '';
  searchStartDate.value = '';
  searchEndDate.value = '';
  currentPage.value = 0;
});

onMounted(() => {
  fetchTransactions();
});
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-dialog {
  margin-top: 100px;
}
</style>