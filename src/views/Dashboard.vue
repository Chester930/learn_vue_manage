vue
<script setup>
import { ref, onMounted } from 'vue'; // 引入 ref 和 onMounted
import axios from 'axios'; // 引入 Axios
import MiniStatisticsCard from "@/examples/Cards/MiniStatisticsCard.vue";
import GradientLineChart from "@/examples/Charts/GradientLineChart.vue";
import Carousel from "./components/Carousel.vue";
import CategoriesList from "./components/CategoriesList.vue";
import US from "@/assets/img/icons/flags/US.png";
import DE from "@/assets/img/icons/flags/DE.png";
import GB from "@/assets/img/icons/flags/GB.png";
import BR from "@/assets/img/icons/flags/BR.png";

const sales = {
  us: {
    country: "United States",
    sales: 2500,
    value: "$230,900",
    bounce: "29.9%",
    flag: US,
  },
  germany: {
    country: "Germany",
    sales: "3.900",
    value: "$440,000",
    bounce: "40.22%",
    flag: DE,
  },
  britain: {
    country: "Great Britain",
    sales: "1.400",
    value: "$190,700",
    bounce: "23.44%",
    flag: GB,
  },
  brasil: {
    country: "Brasil",
    sales: "562",
    value: "$143,960",
    bounce: "32.14%",
    flag: BR,
  },
};

const userCount = ref(0);
const creatorCount = ref(0);
const courseCount = ref(0); 
const monthlyTransactionAmount = ref(0);

// 獲取用戶數量的函數
const fetchUserCount = async () => {
  try {
    const response = await axios.get('http://localhost:8080/myapp/admin/users/count'); // 獲取用戶數量
    userCount.value = response.data.count; // 將返回的用戶數量賦值給 userCount
  } catch (error) {
    console.error("錯誤", error);
  }
};

// 獲取創作者數量的函數
const fetchCreatorCount = async () => {
  try {
    const response = await axios.get('http://localhost:8080/myapp/admin/creators/count');
    console.log('Creator count response:', response.data); // 添加日誌
    creatorCount.value = response.data.count;
  } catch (error) {
    console.error("錯誤", error);
  }
};

// 獲取課程數量的函數
const fetchCoursesCount = async () => {
  try {
    const response = await axios.get('http://localhost:8080/myapp/admin/courses/count'); // 獲取課程數量
    courseCount.value = response.data.count; // 修正為 courseCount 而不是 coursesCount
  } catch (error) {
    console.error("錯誤", error);
  }
};

const fetchMonthlyTransactionAmount = async () => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const response = await axios.get('http://localhost:8080/myapp/admin/order/dateRange', {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    });
    
// 計算本月總交易金額
monthlyTransactionAmount.value = response.data.reduce((sum, order) => sum + order.totalPrice, 0);
  } catch (error) {
    console.error("錯誤", error);
  }
};

// 在組件加載時調用 fetchUserCount
onMounted(() => {
  fetchUserCount();
  fetchCreatorCount();
  fetchCoursesCount(); // 添加此行來調用 fetchCoursesCount
  fetchMonthlyTransactionAmount();
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-lg-12">
        <div class="row">
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="用戶數量"
              :value="`${userCount}人`"
              description="
                <!-- <span class='text-sm font-weight-bolder text-success'>+55%</span> since yesterday -->
                <a href='/profile' class='btn btn-primary mt-3 d-block'>查看詳情</a>
              "
              :icon="{
                component: 'fa fa-user-o',
                background: 'bg-gradient-primary',
                shape: 'rounded-circle',
              }"
            />
          </div>
          
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="創作者數量"
              :value="`${creatorCount}人`"
              description="
              <!-- <span class='text-sm font-weight-bolder text-success'
                >+3%</span> since last week -->
                <a href='/creator' class='btn btn-danger mt-3 d-block'>查看詳情</a>"
              :icon="{
                component: 'fa fa-address-card-o',
                background: 'bg-gradient-danger',
                shape: 'rounded-circle',
              }"
            />
          </div>

          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
              title="課程數量"
              :value="`${courseCount}堂`"
              description="
              <!-- <span class='text-sm font-weight-bolder text-danger'
                >-2%</span> since last quarter -->
                <a href='/course' class='btn btn-success mt-3 d-block'>查看詳情</a>"
              :icon="{
                component: 'fa fa-university',
                background: 'bg-gradient-success',
                shape: 'rounded-circle',
              }"
            />
          </div>
          
          <div class="col-lg-3 col-md-6 col-12">
            <mini-statistics-card
  title="本月交易金額"
  :value="`$${monthlyTransactionAmount.toFixed(2)}`"
  description="
  <a href='/transaction' class='btn btn-warning mt-3 d-block'>查看詳情</a>"
  :icon="{
    component: 'ni ni-money-coins',
    background: 'bg-gradient-warning',
    shape: 'rounded-circle',
  }"
            />
          </div>
        </div>
        <div class="row">
          <div class="col-lg-7 mb-lg">
            <!-- line chart -->
            <div class="card z-index-2">
              <gradient-line-chart
                id="chart-line"
                title="Sales Overview"
                description="<i class='fa fa-arrow-up text-success'></i>
                  <span class='font-weight-bold'>4% more</span> in 2021"
                :chart="{
                  labels: [
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ],
                  datasets: [
                    {
                      label: 'Mobile Apps',
                      data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
                    },
                  ],
                }"
              />
            </div>
          </div>
          <div class="col-lg-5">
            <carousel />
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-lg-7 mb-lg-0 mb-4">
            <div class="card">
              <div class="p-3 pb-0 card-header">
                <div class="d-flex justify-content-between">
                  <h6 class="mb-2">Sales by Country</h6>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table align-items-center">
                  <tbody>
                    <tr v-for="(sale, index) in sales" :key="index">
                      <td class="w-30">
                        <div class="px-2 py-1 d-flex align-items-center">
                          <div>
                            <img :src="sale.flag" alt="Country flag" />
                          </div>
                          <div class="ms-4">
                            <p class="mb-0 text-xs font-weight-bold">
                              Country:
                            </p>
                            <h6 class="mb-0 text-sm">{{ sale.country }}</h6>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="text-center">
                          <p class="mb-0 text-xs font-weight-bold">Sales:</p>
                          <h6 class="mb-0 text-sm">{{ sale.sales }}</h6>
                        </div>
                      </td>
                      <td>
                        <div class="text-center">
                          <p class="mb-0 text-xs font-weight-bold">Value:</p>
                          <h6 class="mb-0 text-sm">{{ sale.value }}</h6>
                        </div>
                      </td>
                      <td class="text-sm align-middle">
                        <div class="text-center col">
                          <p class="mb-0 text-xs font-weight-bold">Bounce:</p>
                          <h6 class="mb-0 text-sm">{{ sale.bounce }}</h6>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="col-lg-5">
            <categories-list
              :categories="[
                {
                  icon: {
                    component: 'ni ni-mobile-button',
                    background: 'dark',
                  },
                  label: 'Devices',
                  description: '250 in stock <strong>346+ sold</strong>',
                },
                {
                  icon: {
                    component: 'ni ni-tag',
                    background: 'dark',
                  },
                  label: 'Tickets',
                  description: '123 closed <strong>15 open</strong>',
                },
                {
                  icon: { component: 'ni ni-box-2', background: 'dark' },
                  label: 'Error logs',
                  description: '1 is active <strong>40 closed</strong>',
                },
                {
                  icon: { component: 'ni ni-satisfied', background: 'dark' },
                  label: 'Happy Users',
                  description: '+ 430',
                },
              ]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
