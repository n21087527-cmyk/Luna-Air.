<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>World Health Risk Map - NASA Data</title>

  <!-- تنسيقات أساسية -->
  <style>
    body {
      background: #0f0f13;
      font-family: Arial, sans-serif;
      color: white;
      text-align: center;
      margin: 0;
      padding: 0;
    }

    #map {
      width: 90%;
      height: 500px;
      margin: 30px auto;
      border-radius: 15px;
    }

    .legend {
      background: #1a1a20;
      padding: 15px;
      border-radius: 10px;
      width: 80%;
      margin: 10px auto;
      text-align: left;
    }

    button {
      background-color: #6a00ff;
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 25px;
      transition: 0.3s;
    }

    button:hover {
      background-color: #9b5df7;
      box-shadow: 0 0 10px rgba(155, 93, 247, 0.6);
    }
  </style>

  <!-- مكتبة خريطة Leaflet -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
</head>

<body>
  <h1>🌍 World Health Risk Map</h1>
  <button id="showMapBtn">Show Map</button>

  <div id="map" style="display:none;"></div>
  <div class="legend" id="legend" style="display:none;"></div>

  <script>
    // بيانات الأمراض ومواقعها (نقدر نبدّلها لاحقًا ببيانات ناسا)
    const diseaseData = [
      { coords: [30.0444, 31.2357], emoji: "🌬️", name: "Asthma", city: "Cairo", desc: "يتأثر بالأتربة و ثاني أكسيد النيتروجين" },
      { coords: [40.7128, -74.006], emoji: "🤧", name: "Allergy", city: "New York", desc: "يتأثر بحبوب اللقاح والغبار" },
      { coords: [48.8566, 2.3522], emoji: "❤️", name: "Heart Disease", city: "Paris", desc: "يتأثر بتلوث الهواء PM2.5" },
      { coords: [35.6895, 139.6917], emoji: "👶", name: "Children Risk", city: "Tokyo", desc: "الأطفال أكثر حساسية للتلوث" },
      { coords: [55.7558, 37.6173], emoji: "👵", name: "Elderly Risk", city: "Moscow", desc: "كبار السن يتأثروا بسرعة بجودة الهواء" },
    ];

    // عند الضغط على زر "Show Map"
    document.getElementById("showMapBtn").addEventListener("click", () => {
      document.getElementById("map").style.display = "block";
      document.getElementById("legend").style.display = "block";

      // إنشاء الخريطة
      const map = L.map("map").setView([20, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // إنشاء نقاط (Markers) للأمراض
      diseaseData.forEach((disease) => {
        const marker = L.marker(disease.coords)
          .addTo(map)
          .bindPopup(`${disease.emoji} <b>${disease.name}</b><br>${disease.city}<br>${disease.desc}`);
      });

      // إنشاء الشرح (Legend) ديناميكيًا
      const legendDiv = document.getElementById("legend");
      legendDiv.innerHTML = "<h3>📘 Legend (شرح الأيقونات)</h3>";
      diseaseData.forEach((disease) => {
        const p = document.createElement("p");
        p.innerHTML = `${disease.emoji} <b>${disease.name}</b> → ${disease.desc}`;
        legendDiv.appendChild(p);
      });
    });
  </script>
</body>
</html>




































































































































































