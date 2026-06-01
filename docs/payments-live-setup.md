# تفعيل الدفع الحقيقي

الموقع يستخدم Moyasar للدفع. فيزا وماستركارد ومدى تظهر من طريقة `creditcard`، وأبل باي تظهر من `applepay`.

## المطلوب من صاحب الموقع

1. إنشاء أو تفعيل حساب تاجر في Moyasar.
2. تفعيل وسائل الدفع المطلوبة داخل لوحة Moyasar:
   - Mada
   - Visa
   - Mastercard
   - Apple Pay
3. نسخ مفتاح الإنتاج العام من Moyasar، ويبدأ عادة بـ `pk_live_`.
4. إضافة المفتاح في Netlify كمتغير بيئة:

```env
VITE_MOYASAR_PUBLIC_KEY=pk_live_...
```

5. عمل Deploy جديد في Netlify بعد حفظ المتغير.

## روابط الرجوع

استخدم رابط الموقع الحقيقي كـ callback/redirect في إعدادات Moyasar عند الحاجة:

```text
https://xn--wgb8axa.com/checkout
```

## ملاحظات مهمة

- لا تستخدم مفاتيح test في الإنتاج. الكود يمنع `pk_test_` في build الإنتاج.
- لا تضع secret keys في واجهة الموقع أو Netlify frontend variables.
- Apple Pay يحتاج أن يكون مفعلًا من Moyasar وقد يتطلب تحقق الدومين من طرف مزود الدفع.
