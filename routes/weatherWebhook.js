const express = require('express');
const router = express.Router();
const { processIncomingWeatherAlert } = require('../services/weatherAlertService');

// Express Webhook Endpoint for NWS / ESTOFEX / Meteo Alerts
router.post('/api/v1/solvision/weather-alert', async (req, res) => {
  try {
    const alertData = req.body;

    // التحقق الأول من اكتمال عناصر التنبيه
    if (!alertData || !alertData.geometry || !alertData.alert_id) {
      return res.status(400).json({
        success: false,
        error: 'Payload غير مكتمل البيانات المكانية (يتطلب alert_id و geometry مع coordinates)'
      });
    }

    // تشغيل المعالجة الهندسية والمكانية
    const result = await processIncomingWeatherAlert(alertData);

    return res.status(200).json({
      success: true,
      message: 'تمت معالجة التنبيه بنجاح وتنفيذ الإجراءات الميدانية المؤتمتة',
      data: result
    });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ داخلي أثناء معالجة استعلام PostGIS'
    });
  }
});

module.exports = router;
