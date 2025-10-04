<!doctype html>
<html lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard - خريطة المخاطر البيئية</title>

  <!-- Leaflet (خريطة) -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="" crossorigin="" />
  <style>
    :root{ --bg:#f6f9fc; --card:#ffffff; --accent:#0b74de }
    html,body{height:100%;margin:0;font-family:Tahoma, Arial, sans-serif;background:var(--bg);direction:rtl}
    .app{display:flex;gap:16px;height:100vh;padding:12px;box-sizing:border-box}
    .map-wrap{flex:1;min-width:320px;background:var(--card);border-radius:10px;box-shadow:0 6px 18px rgba(10,20,40,0.06);overflow:hidden}
    #map{width:100%;height:100%}

    .panel{width:420px;display:flex;flex-direction:column;gap:12px}
    .card{background:var(--card);padding:12px;border-radius:10px;box-shadow:0 6px 18px rgba(10,20,40,0.06)}
    h2{margin:0 0 8px 0;font-size:18px}

    .controls{display:flex;gap:8px;align-items:center}
    .btn{background:var(--accent);color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer}
    .btn.secondary{background:#e7eefc;color:#03366b}

    .cities{overflow:auto;max-height:60vh;padding-right:4px}
    .city{display:flex;gap:8px;align-items:center;padding:8px;border-radius:8px;border:1px solid #f0f2f6;margin-bottom:8px}
    .emoji{font-size:28px;width:48px;text-align:center}
    .meta{flex:1}
    .meta h3{margin:0;font-size:16px}
    .meta .small{font-size:13px;color:#666;margin-top:4px}
    canvas{width:100%!important;height:70px!important}

    .status-badge{display:inline-block;padding:4px 8px;border-radius:999px;font-weight:600}
    .status-good{background:#e6fbf0;color:#06623b}
    .status-warn{background:#fff4e5;color:#b86b00}
    .status-bad{background:#fdebea;color:#a12020}

    footer{font-size:13px;color:#666;text-align:center}

    /* emoji map marker */
    .emoji-marker{font-size:20px;line-height:1;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,0.9);box-shadow:0 2px 6px rgba(0,0,0,0.15)}
  </style>
</head>
<body>
  <div class="app">
    <div class="map-wrap card">
      <div id="map"></div>
    </div>

    <div class="panel">
      <div class="card">
        <h2>لوحة التحكم - خريطة المخاطر</h2>
        <div class="controls">
          <button id="refreshAll" class="btn">تحديث الكل</button>
          <button id="toggleNotify" class="btn secondary">تشغيل الإشعارات</button>
          <div style="flex:1;text-align:left;font-size:13px;color:#444">آخر تحديث: <span id="lastUpdate">-</span></div>
        </div>
      </div>

      <div class="card">
        <h3>المدن المراقبة</h3>
        <div class="cities" id="citiesContainer">
          <!-- القوائم ستملىء ديناميكياً -->
        </div>
      </div>

      <div class="card">
        <h3>ملاحظات</h3>
        <ul style="margin:6px 0 0 18px;padding:0;color:#444;">
          <li>اضغط "تحديث" أمام أي مدينة لجلب بيانات مباشرة من السيرفر.</li>
          <li>الرسم البياني مصمم كـ history محلي للـ updates الواردة عبر socket.io.</li>
        </ul>
      </div>

      <footer class="card">مصدر البيانات: NASA POWER · الربط عبر Socket.IO و REST API</footer>
    </div>
  </div>

  <!-- مكتبات -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <script>
    // ===================== تهيئة المدن (تأكد أنها تطابق سيرفرك) =====================
    const CITIES = [
      { id: 'cairo', name: 'Cairo, Egypt', lat: 30.0444, lon: 31.2357 },
      { id: 'riyadh', name: 'Riyadh, Saudi Arabia', lat: 24.7136, lon: 46.6753 },
      { id: 'newyork', name: 'New York, USA', lat: 40.7128, lon: -74.0060 },
      { id: 'tokyo', name: 'Tokyo, Japan', lat: 35.6764, lon: 139.6500 },
      { id: 'london', name: 'London, UK', lat: 51.5072, lon: -0.1276 }
    ];

    // ===================== حالة التطبيق =====================
    const histories = {}; // مخزن محلي لسلاسل PM2.5
    const charts = {};     // مرجع الرسومات
    const markers = {};
    let notificationsEnabled = false;

    // ===================== إنشاء الـ DOM لكل مدينة =====================
    const citiesContainer = document.getElementById('citiesContainer');
    CITIES.forEach(city => {
      histories[city.id] = Array(12).fill(null); // بداية: 12 نقطة فارغة

      const el = document.createElement('div');
      el.className = 'city';
      el.id = 'city-' + city.id;
      el.innerHTML = `
        <div class="emoji" id="emoji-${city.id}">—</div>
        <div class="meta">
          <h3>${city.name}</h3>
          <div class="small">الحالة: <span id="type-${city.id}">—</span></div>
          <div class="small">آخر تحديث: <span id="updated-${city.id}">—</span></div>
          <div style="margin-top:8px"><canvas id="chart-${city.id}"></canvas></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button data-city="${city.id}" class="btn btn-refresh">تحديث</button>
        </div>
      `;
      citiesContainer.appendChild(el);

      // انشاء الرسم
      const ctx = document.getElementById('chart-' + city.id).getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array(histories[city.id].length).fill(''),
          datasets: [{
            label: 'PM2.5',
            data: histories[city.id].slice(),
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2
          }]
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { display: false }, y: { display: false } },
          plugins: { legend: { display: false } }
        }
      });
      charts[city.id] = chart;
    });

    // ===================== الخريطة و markers =====================
    const map = L.map('map', { zoomControl: true }).setView([20, 10], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    CITIES.forEach(city => {
      const icon = L.divIcon({ className: 'emoji-marker', html: '—' });
      const m = L.marker([city.lat, city.lon], { icon }).addTo(map);
      markers[city.id] = m;
    });

    // ===================== مساعدة: تحديث DOM عند وصول سجل =====================
    function formatTime(t){
      try { return new Date(t).toLocaleString('ar-EG'); } catch(e){ return t }
    }

    function pushHistory(cityId, value){
      const arr = histories[cityId] || [];
      if (value === null || value === undefined) value = null;
      arr.push(value);
      while(arr.length > 20) arr.shift();
      histories[cityId] = arr;
      return arr;
    }

    function updateChart(cityId){
      const ch = charts[cityId];
      if (!ch) return;
      ch.data.datasets[0].data = histories[cityId].map(v => v === null ? null : v);
      ch.update();
    }

    function updateCityUI(record){
      // محاولة تحديد المدينة عن طريق اقرب إحداثي
      const city = CITIES.find(c => Math.abs(c.lat - (record.lat||record.latitude||0)) < 0.001 && Math.abs(c.lon - (record.lon||record.longitude||0)) < 0.001)
                || CITIES.find(c => (record.locationName && record.locationName.toLowerCase().includes(c.name.split(',')[0].toLowerCase())))
                || CITIES[0];

      const id = city.id;
      // استخراج PM2.5 من rawParams اذا موجود
      const pm = (record.rawParams && (record.rawParams.PM2P5 ?? record.rawParams.PM2_5)) ?? null;

      // تحديث النص
      document.getElementById('emoji-' + id).textContent = record.emoji || '—';
      document.getElementById('type-' + id).textContent = record.type || record.description || '—';
      document.getElementById('updated-' + id).textContent = formatTime(record.updatedAt || new Date());

      // تحديث الخريطة
      const iconHtml = `<div class=\"emoji-marker\">${record.emoji || '—'}</div>`;
      markers[id].setIcon(L.divIcon({ className: 'emoji-marker', html: record.emoji || '—' }));

      // دفع للقيم التاريخية وتحديث الرسم
      const arr = pushHistory(id, pm !== null ? Number(pm) : null);
      updateChart(id);

      // اشعار المتصفح لو مطلوب
      if (notificationsEnabled && record.emoji && record.emoji !== '✅'){
        try{
          if (Notification.permission === 'granted'){
            new Notification('⚠️ ' + city.name, { body: (record.type || '') + ' — ' + (record.description || '' ) });
          }
        }catch(e){ console.warn('Notification failed', e) }
      }

      document.getElementById('lastUpdate').textContent = formatTime(new Date());
    }

    // ===================== جلب الحالة الابتدائية من السيرفر =====================
    async function fetchAllStatus(){
      try{
        const res = await fetch('/api/risks');
        if (!res.ok) throw new Error('no data');
        const list = await res.json();
        // initialize histories with current pm values
        list.forEach(item => {
          // determine city id similar to updateCityUI
          const city = CITIES.find(c => Math.abs(c.lat - (item.lat||0)) < 0.001 && Math.abs(c.lon - (item.lon||0)) < 0.001)
                    || CITIES.find(c => (item.locationName && item.locationName.toLowerCase().includes(c.name.split(',')[0].toLowerCase())));
          if (!city) return;
          const id = city.id;
          const pm = (item.rawParams && (item.rawParams.PM2P5 ?? item.rawParams.PM2_5)) ?? null;
          // prefill history with the same value so chart isn't empty
          histories[id] = Array(8).fill(pm !== null ? Number(pm) : null);
        });
        // update UI for each item
        list.forEach(it => updateCityUI(it));
      }catch(err){
        console.warn('تعذر جلب البيانات الأولية:', err);
      }
    }

    // ===================== استدعاءات Live (تحديث يدوي) =====================
    async function fetchLiveForCity(city){
      try{
        const res = await fetch(`/api/risks/live?lat=${city.lat}&lon=${city.lon}`);
        if (!res.ok) throw new Error('live fetch failed');
        const data = await res.json();
        updateCityUI(data);
      }catch(e){
        console.error('خطأ في جلب Live لـ', city.name, e);
      }
    }

    document.getElementById('refreshAll').addEventListener('click', async ()=>{
      document.getElementById('refreshAll').textContent = 'جاري التحديث...';
      await Promise.all(CITIES.map(c => fetchLiveForCity(c)));
      document.getElementById('refreshAll').textContent = 'تحديث الكل';
    });

    // تفعيل/تعطيل الإشعارات
    document.getElementById('toggleNotify').addEventListener('click', async ()=>{
      if (!notificationsEnabled){
        const perm = await Notification.requestPermission();
        if (perm === 'granted'){
          notificationsEnabled = true;
          document.getElementById('toggleNotify').textContent = 'إيقاف الإشعارات';
        }
      } else {
        notificationsEnabled = false;
        document.getElementById('toggleNotify').textContent = 'تشغيل الإشعارات';
      }
    });

    // ===================== Socket.IO للـ live updates =====================
    const socket = io();
    socket.on('connect', ()=> console.log('socket connected'));
    socket.on('risk-update', data => {
      try{ updateCityUI(data); }catch(e){console.error(e)}
    });

    // init
    fetchAllStatus();
  </script>
</body>
</html>



























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































