fetch('http://localhost:3000/api/dashboard?role=ADMIN_NASIONAL&wilayah=Nasional&trendFilter=7_bulan').then(res => res.json()).then(console.log).catch(console.error);
