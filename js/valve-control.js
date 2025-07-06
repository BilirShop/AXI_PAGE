const { createApp, reactive } = Vue;

createApp({
  data() {
    return {
      message: 'Hello World',
      valves: [
        { id: 1, name: 'Ana Vana', state: 'active', min: 2.5, max: 4.0, hours: 2, minutes: 30, updated: '2 dk önce' },
        { id: 2, name: 'Bölge 1 Vana', state: 'paused', min: 2.0, max: 3.5, hours: 1, minutes: 45, updated: '5 dk önce' },
        { id: 3, name: 'Bölge 2 Vana', state: 'stopped', min: 1.8, max: 3.2, hours: 3, minutes: 15, updated: '15 dk önce' },
        { id: 4, name: 'Bölge 3 Vana', state: 'active', min: 2.2, max: 3.8, hours: 2, minutes: 0, updated: '1 dk önce' },
        { id: 5, name: 'Bölge 4 Vana', state: 'waiting', min: 1.5, max: 2.8, hours: 1, minutes: 30, updated: '30 dk önce' },
        { id: 6, name: 'Bölge 5 Vana', state: 'active', min: 2.0, max: 3.5, hours: 4, minutes: 0, updated: '3 dk önce' },
        { id: 7, name: 'Bölge 6 Vana', state: 'paused', min: 1.8, max: 3.0, hours: 2, minutes: 15, updated: '8 dk önce' },
        { id: 8, name: 'Bölge 7 Vana', state: 'stopped', min: 2.2, max: 3.8, hours: 1, minutes: 45, updated: '25 dk önce' },
        { id: 9, name: 'Bölge 8 Vana', state: 'active', min: 1.5, max: 2.5, hours: 3, minutes: 30, updated: '1 dk önce' },
        { id: 10, name: 'Bölge 9 Vana', state: 'waiting', min: 2.0, max: 3.5, hours: 2, minutes: 0, updated: '12 dk önce' },
      ],
      states: {
        active: { label: 'Aktif', badge: 'success', icon: 'fa-play' },
        paused: { label: 'Duraklatıldı', badge: 'warning', icon: 'fa-pause' },
        stopped: { label: 'Kapalı', badge: 'danger', icon: 'fa-stop' },
        waiting: { label: 'Beklemede', badge: 'info', icon: 'fa-clock' },
      },
      notification: null,
      notificationType: 'success',
      notificationTimeout: null
    }
  },
  computed: {
    summary() {
      const s = { active: 0, paused: 0, stopped: 0, waiting: 0 };
      this.valves.forEach(v => s[v.state]++);
      return s;
    }
  },
  methods: {
    setState(valve, state) {
      valve.state = state;
      valve.updated = 'Şimdi';
      this.showNotification(`Vana durumu: ${this.states[state].label}`,
        state === 'active' ? 'success' : state === 'paused' ? 'warning' : state === 'stopped' ? 'danger' : 'info');
    },
    saveAll() {
      this.showNotification('Tüm ayarlar kaydedildi', 'success');
    },
    startAll() {
      this.valves.forEach(v => this.setState(v, 'active'));
      this.showNotification('Tüm vanalar başlatıldı', 'success');
    },
    pauseAll() {
      this.valves.forEach(v => this.setState(v, 'paused'));
      this.showNotification('Tüm vanalar duraklatıldı', 'warning');
    },
    stopAll() {
      this.valves.forEach(v => this.setState(v, 'stopped'));
      this.showNotification('Tüm vanalar durduruldu', 'danger');
    },
    validatePressure(valve) {
      if (parseFloat(valve.min) >= parseFloat(valve.max)) {
        this.showNotification('Minimum basınç, maksimumdan küçük olmalı', 'danger');
        valve.min = '';
      }
    },
    validateTime(valve) {
      if (valve.hours < 0 || valve.hours > 24) {
        this.showNotification('Saat 0-24 arası olmalı', 'danger');
        valve.hours = '';
      }
      if (valve.minutes < 0 || valve.minutes > 59) {
        this.showNotification('Dakika 0-59 arası olmalı', 'danger');
        valve.minutes = '';
      }
    },
    showNotification(msg, type) {
      this.notification = msg;
      this.notificationType = type;
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = setTimeout(() => this.notification = null, 2500);
    }
  },
  mounted() {
    setInterval(() => {
      this.valves.forEach(v => {
        if (v.updated && v.updated.includes('dk önce')) {
          let m = parseInt(v.updated);
          if (!isNaN(m)) v.updated = (m + 1) + ' dk önce';
        }
      });
    }, 60000);
  },
  
  template: `
  <div class="my-4">
    <div v-if="notification" :class="'alert alert-' + notificationType + ' position-fixed'" style="top:20px;left:50%;transform:translateX(-50%);z-index:9999;min-width:300px;max-width:90vw;">
      <i class="fa-solid fa-circle-info me-2"></i>{{notification}}
    </div>
    <div class="card mb-4">
      <div class="card-body">
        <h4 class="card-title">Tarım Sulama Vanaları Kontrol Paneli (Vue)</h4>
        <div class="table-responsive">
          <table class="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th style="width:20px;"></th>
                <th>Vana No</th>
                <th>Vana Adı</th>
                <th>Durum</th>
                <th>Min Basınç (Bar)</th>
                <th>Max Basınç (Bar)</th>
                <th>Çalışma Süresi</th>
                <th>Son Güncelleme</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <draggable
              tag="tbody"
              v-model="valves"
              item-key="id"
              :animation="200"
              handle=".drag-handle"
            >
              <template #item="{ element, index }">
                <tr>
                  <td><i class="fa-solid fa-grip-vertical drag-handle" style="cursor:grab"></i></td>
                  <td>{{ index + 1 }}</td>
                  <td>{{ element.name }}</td>
                  <td>
                    <span :class="'badge bg-' + states[element.state].badge">{{ states[element.state].label }}</span>
                  </td>
                  <td>
                    <input type="number" class="form-control form-control-sm" v-model.number="element.min" min="0" max="10" step="0.1" style="width:80px;" @change="validatePressure(element)">
                  </td>
                  <td>
                    <input type="number" class="form-control form-control-sm" v-model.number="element.max" min="0" max="10" step="0.1" style="width:80px;" @change="validatePressure(element)">
                  </td>
                  <td>
                    <div class="row g-1">
                      <div class="col-6">
                        <input type="number" class="form-control form-control-sm" v-model.number="element.hours" min="0" max="24" placeholder="Saat" style="width:60px;" @change="validateTime(element)">
                      </div>
                      <div class="col-6">
                        <input type="number" class="form-control form-control-sm" v-model.number="element.minutes" min="0" max="59" placeholder="Dakika" style="width:60px;" @change="validateTime(element)">
                      </div>
                    </div>
                  </td>
                  <td>{{ element.updated }}</td>
                  <td>
                    <button class="btn btn-success btn-sm me-1" @click="setState(element, 'active')" title="Başlat">
                      <i class="fa-solid fa-play"></i>
                    </button>
                    <button class="btn btn-warning btn-sm me-1" @click="setState(element, 'paused')" title="Duraklat">
                      <i class="fa-solid fa-pause"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" @click="setState(element, 'stopped')" title="Durdur">
                      <i class="fa-solid fa-stop"></i>
                    </button>
                  </td>
                </tr>
              </template>
            </draggable>
          </table>
        </div>
        <div class="row mt-4">
          <div class="col-md-6 mb-2">
            <button class="btn btn-primary btn-lg me-2" @click="saveAll"><i class="fa-solid fa-floppy-disk me-2"></i>Tüm Ayarları Kaydet</button>
            <button class="btn btn-success btn-lg" @click="startAll"><i class="fa-solid fa-play me-2"></i>Tümünü Başlat</button>
          </div>
          <div class="col-md-6 text-end">
            <button class="btn btn-warning btn-lg me-2" @click="pauseAll"><i class="fa-solid fa-pause me-2"></i>Tümünü Duraklat</button>
            <button class="btn btn-danger btn-lg" @click="stopAll"><i class="fa-solid fa-stop me-2"></i>Tümünü Durdur</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card bg-light mb-4">
      <div class="card-body">
        <h5 class="card-title">Sistem Durumu Özeti</h5>
        <div class="row text-center">
          <div class="col-md-3">
            <i class="fa-solid fa-play text-success fa-lg"></i>
            <div>Aktif Vanalar</div>
            <div class="fw-bold text-success">{{summary.active}}</div>
          </div>
          <div class="col-md-3">
            <i class="fa-solid fa-pause text-warning fa-lg"></i>
            <div>Duraklatılan</div>
            <div class="fw-bold text-warning">{{summary.paused}}</div>
          </div>
          <div class="col-md-3">
            <i class="fa-solid fa-stop text-danger fa-lg"></i>
            <div>Kapalı Vanalar</div>
            <div class="fw-bold text-danger">{{summary.stopped}}</div>
          </div>
          <div class="col-md-3">
            <i class="fa-solid fa-clock text-info fa-lg"></i>
            <div>Bekleyen</div>
            <div class="fw-bold text-info">{{summary.waiting}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  components: {
    draggable: window.vuedraggable || window.VueDraggableNext,
  },
}).mount('#app');
