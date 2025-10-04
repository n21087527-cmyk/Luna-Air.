// updateProfile.js
// دالة لتحديث الملف الصحي للمستخدم عبر API

async function updateProfile(age, isAthlete, illnesses) {
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('🚫 المستخدم غير مسجل الدخول');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ age, isAthlete, illnesses })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ تم تحديث الملف الصحي بنجاح:', data.profile);
    } else {
      console.error('⚠️ خطأ في تحديث الملف الصحي:', data.message);
    }
  } catch (error) {
    console.error('❌ حدث خطأ أثناء الاتصال بالسيرفر:', error);
  }
}

// يمكنك استدعاؤها في الكود كالتالي:
updateProfile(25, true, ['الربو', 'السكري']);

// تصدير الدالة (اختياري - احذف السطر ده لو الملف للمتصفح فقط)
export { updateProfile };
