import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Banknote, CheckCircle2, CreditCard, Landmark, MapPin, Locate, Search, Navigation
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWebAuth } from '../features/auth/WebAuthProvider';
import { saveWebCheckoutDraft } from '../lib/webCheckoutDraft';
import { loadExternalScript, loadExternalStylesheet } from '../lib/externalAssets';
import {
  BANK_TRANSFER_DETAILS,
  MANUAL_PAYMENT_METHODS,
  buildOrderWhatsAppLink,
  getManualPaymentMethodLabel,
  openWhatsAppLink,
  type ManualPaymentMethod,
} from '../lib/contact';
import { formatSarPrice } from '../lib/utils';
import {
  DELIVERY_FLOOR_OPTIONS,
  FREE_DELIVERY_CARTONS,
  MIN_DELIVERY_CARTONS,
  getDeliveryPolicySummary,
  getDeliveryRuleState,
  getFloorDeliveryFee,
  requiresFloorFeeAgreement,
  type DeliveryFloorLevel,
} from '../lib/deliveryRules';
import ProductImage from '../components/ProductImage';

const LEAFLET_SCRIPT_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_STYLES_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

type CheckoutFormData = {
  name: string;
  phone: string;
  address: string;
  floorLevel: DeliveryFloorLevel;
  lat: number;
  lng: number;
};

export default function Checkout() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, totalItems, totalCartons } = useCart();
  const { isConfigured, session, profile, saveProfile, openAccountDialog } = useWebAuth();
  const isRTL = i18n.language === 'ar';

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    const saved = localStorage.getItem('reeq_checkout_data');
    const savedData = saved ? JSON.parse(saved) : null;

    return savedData ? {
      ...savedData,
      floorLevel: savedData.floorLevel ?? 'ground',
    } : {
      name: '',
      phone: '',
      address: '',
      floorLevel: 'ground',
      lat: 24.7136,
      lng: 46.6753,
    };
  });

  // Persist form data to localStorage
  useEffect(() => {
    localStorage.setItem('reeq_checkout_data', JSON.stringify(formData));
  }, [formData]);

  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const isWhatsAppCheckout = queryParams.get('channel') === 'whatsapp';
  const [accountNotice, setAccountNotice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<ManualPaymentMethod>('cash_on_delivery');

  const deliveryRule = getDeliveryRuleState(totalCartons);
  const deliveryFee = deliveryRule.deliveryFee;
  const floorDeliveryFee = getFloorDeliveryFee(formData.floorLevel);
  const needsFloorAgreement = requiresFloorFeeAgreement(formData.floorLevel);
  const totalDeliveryFee = deliveryFee + floorDeliveryFee;
  const finalTotal = totalPrice + totalDeliveryFee;
  const deliveryPolicy = getDeliveryPolicySummary(isRTL);
  const canSubmitCustomerDetails = Boolean(
    formData.name.trim() && formData.phone.trim() && formData.address.trim()
  );
  const selectedPaymentMethodLabel = getManualPaymentMethodLabel(paymentMethod, isRTL);
  const paymentMethodIcons = {
    cash_on_delivery: Banknote,
    bank_transfer: Landmark,
    pos_on_delivery: CreditCard,
  } satisfies Record<ManualPaymentMethod, typeof Banknote>;

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFormData((current) => ({
      ...current,
      name: current.name || profile.fullName || '',
      phone: current.phone || profile.phone || '',
      address: current.address || profile.defaultAddress || '',
      lat: current.address ? current.lat : (profile.defaultLat ?? current.lat),
      lng: current.address ? current.lng : (profile.defaultLng ?? current.lng),
    }));
  }, [profile]);

  useEffect(() => {
    if (!showMap) {
      return;
    }

    let isCancelled = false;
    setMapLoadError('');

    Promise.all([
      loadExternalStylesheet(LEAFLET_STYLES_URL),
      loadExternalScript(LEAFLET_SCRIPT_URL),
    ])
      .then(() => {
        if (!isCancelled) {
          setIsLeafletReady(true);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setMapLoadError(
            isRTL
              ? 'تعذر تحميل الخريطة الآن. يمكنك كتابة العنوان يدويًا والمتابعة.'
              : 'Unable to load the map right now. You can enter the address manually and continue.'
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isRTL, showMap]);

  // Leaflet Map Initialization & Rendering Fix
  useEffect(() => {
    if (showMap && isLeafletReady && mapContainerRef.current && !mapRef.current) {
      const L = (window as any).L;
      if (!L) return;

      mapRef.current = L.map(mapContainerRef.current).setView([formData.lat, formData.lng], 12);

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
      }).addTo(mapRef.current);

      L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png', {
        opacity: 0.5,
        attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
      }).addTo(mapRef.current);

      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      markerRef.current = L.marker([formData.lat, formData.lng], {
        draggable: true,
        icon: icon
      }).addTo(mapRef.current);

      markerRef.current.on('dragend', async () => {
        const position = markerRef.current.getLatLng();
        updateLocationData(position.lat, position.lng);
      });

      mapRef.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        markerRef.current.setLatLng([lat, lng]);
        updateLocationData(lat, lng);
      });

      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 300);
    }

    return () => {
      if (!showMap && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [formData.lat, formData.lng, isLeafletReady, showMap]);

  useEffect(() => {
    if (!showMap || !mapRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showMap]);

  const updateLocationData = async (lat: number, lng: number) => {
    setFormData((prev: any) => ({ ...prev, lat, lng }));
    
    // Reverse Geocoding (Free Nominatim API)
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${isRTL ? 'ar' : 'en'}`);
      const data = await response.json();
      if (data.display_name) {
        setFormData((prev: any) => ({ ...prev, address: data.display_name }));
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const getUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev: any) => ({ ...prev, lat: latitude, lng: longitude }));
          
          if (mapRef.current && markerRef.current) {
            mapRef.current.setView([latitude, longitude], 16);
            markerRef.current.setLatLng([latitude, longitude]);
          }
          
          updateLocationData(latitude, longitude);
          setIsLocating(false);
          setShowMap(true);
        },
        () => {
          setIsLocating(false);
          alert(isRTL ? "عفواً، لا يمكن الوصول لموقعك الحالي. يرجى تفعيله من الإعدادات." : "Unable to retrieve your location. Please enable GPS.");
        }
      );
    }
  };

  const handleNextStep = async () => {
    if (!deliveryRule.canDeliver) {
      navigate('/cart');
      return;
    }

    if (step === 1) {
      if (!formData.name || !formData.phone || !formData.address) {
        return;
      }

      if (session?.email) {
        try {
          await saveProfile({
            fullName: formData.name,
            phone: formData.phone,
            defaultAddress: formData.address,
            defaultLat: formData.lat,
            defaultLng: formData.lng,
            locale: isRTL ? 'ar' : 'en',
          });
          setAccountNotice(
            isRTL
              ? '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u062f\u0627\u062e\u0644 \u0627\u0644\u062d\u0633\u0627\u0628 \u0642\u0628\u0644 \u0639\u0631\u0636 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u062d\u0648\u064a\u0644.'
              : 'Your account details were updated before showing bank transfer details.',
          );
        } catch (error) {
          console.error('Unable to save the signed-in shopper profile before checkout.', error);
          setAccountNotice(
            isRTL
              ? '\u062a\u0639\u0630\u0631 \u062a\u062d\u062f\u064a\u062b \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0622\u0646\u060c \u0644\u0643\u0646 \u064a\u0645\u0643\u0646\u0643 \u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0637\u0644\u0628 \u0628\u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0628\u0646\u0643\u064a.'
              : 'We could not update your profile right now, but you can continue the order with bank transfer.',
          );
        }
      } else {
        setAccountNotice('');
      }

      saveWebCheckoutDraft({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerLat: formData.lat,
        customerLng: formData.lng,
        subtotal: totalPrice,
        deliveryFee: totalDeliveryFee,
        discount: 0,
        finalTotal,
        locale: isRTL ? 'ar' : 'en',
        items: items.map((item) => ({
          productId: item.product.id,
          name: isRTL ? item.product.name.ar : item.product.name.en,
          quantity: item.quantity,
          cartonQuantity: item.product.category === 'offer' ? item.product.quantity * item.quantity : item.quantity,
          unitPrice: item.product.price ?? 0,
          lineTotal: (item.product.price ?? 0) * item.quantity,
          image: item.product.image ?? '',
        })),
      });
    }
    setStep(step + 1);
  };

  const buildCurrentOrderWhatsAppLink = () =>
    buildOrderWhatsAppLink({
      customerName: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      lat: formData.lat,
      lng: formData.lng,
      email: session?.email ?? undefined,
      items: items.map((item) => ({
        name: isRTL ? item.product.name.ar : item.product.name.en,
        quantity: item.quantity,
        unitPrice: item.product.price ?? 0,
        lineTotal: (item.product.price ?? 0) * item.quantity,
      })),
      totalItems: totalCartons,
      subtotal: totalPrice,
      deliveryFee: totalDeliveryFee,
      discount: 0,
      finalTotal,
      paymentMethod,
      isRTL,
    });

  const handleWhatsAppOrder = () => {
    if (!deliveryRule.canDeliver) {
      navigate('/cart');
      return;
    }

    if (!canSubmitCustomerDetails) {
      setStep(1);
      return;
    }

    openWhatsAppLink(buildCurrentOrderWhatsAppLink());
  };

  if (items.length === 0 || !deliveryRule.canDeliver) {
    return (
      <main className="relative z-10 flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-20">
        <div className="w-full max-w-lg rounded-[2.5rem] border border-amber-100 bg-white p-8 text-center shadow-xl shadow-gray-200/40">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
            <MapPin className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            {isRTL ? 'الطلب غير جاهز للتوصيل' : 'Order is not ready for delivery'}
          </h1>
          <p className="mt-3 text-sm font-semibold leading-7 text-gray-500">
            {items.length === 0
              ? (isRTL ? 'السلة فارغة الآن. اختر المنتجات أولًا قبل إتمام الطلب.' : 'Your cart is empty. Choose products before checkout.')
              : (isRTL
                  ? `الحد الأدنى للتوصيل هو ${MIN_DELIVERY_CARTONS} كراتين. لديك الآن ${totalCartons} كرتونة، أضف ${deliveryRule.cartonsToMinimum} كرتونة لإتمام الطلب.`
                  : `Minimum delivery order is ${MIN_DELIVERY_CARTONS} cartons. You currently have ${totalCartons}; add ${deliveryRule.cartonsToMinimum} more to check out.`)}
          </p>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="mt-6 w-full rounded-3xl bg-[#153b66] px-5 py-4 text-base font-black text-white transition hover:bg-[#0f2f53]"
          >
            {isRTL ? 'الرجوع للسلة' : 'Back to cart'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-16 sm:py-24 bg-gray-50/50 relative z-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Delivery Flow */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-10">
              <button 
                onClick={() => step === 1 ? navigate('/cart') : setStep(1)}
                className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#153b66] transition-all sm:w-12 sm:h-12"
              >
                <ArrowLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
              <div>
                <h1 className="text-3xl font-black text-gray-900">{isRTL ? 'تحديد الموقع والتوصيل' : 'Delivery & Location'}</h1>
                <p className="text-gray-400 mt-1 text-sm font-medium">{isRTL ? (step === 1 ? 'موقعك في الرياض بدقة عالية' : 'تأكيد الطلب') : (step === 1 ? 'Precision Riyadh location' : 'Order confirmation')}</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-6">
                  <div className={`rounded-3xl border p-4 sm:p-5 ${session ? 'border-emerald-200 bg-emerald-50/90' : 'border-[#153b66]/10 bg-[#153b66]/5'}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-gray-900">
                          {session
                            ? (isRTL ? 'أنت مسجل الآن داخل الحساب' : 'You are signed in now')
                            : (isRTL ? 'التسجيل اختياري لحفظ بياناتك وطلباتك' : 'Signing in is optional to save your details and orders')}
                        </p>
                        <p className="mt-1 text-sm leading-7 text-gray-600">
                          {session
                            ? (isRTL
                                ? `سيتم استخدام ${session.email ?? 'حسابك'} لحفظ بيانات هذا الطلب داخل حسابك.`
                                : `${session.email ?? 'Your account'} will be used to save this order and your details.`)
                            : (isRTL
                                ? 'يمكنك إكمال الطلب كضيف، أو تسجيل الدخول بالإيميل لحفظ الاسم والجوال والعنوان والطلبات الناجحة.'
                                : 'You can continue as a guest, or sign in with email to save your name, phone, address, and successful orders.')}
                        </p>
                        {accountNotice ? (
                          <p className="mt-2 text-sm font-semibold text-[#153b66]">{accountNotice}</p>
                        ) : null}
                        {!session && !isConfigured ? (
                          <p className="mt-2 text-sm font-semibold text-[#153b66]">
                            {isRTL
                              ? 'يمكنك المتابعة الآن كضيف بشكل طبيعي. خيار حفظ البيانات داخل الحساب سيظهر هنا عند تفعيله.'
                              : 'You can continue right now as a guest normally. The option to save your details in an account will appear here once it is enabled.'}
                          </p>
                        ) : null}
                      </div>
                      {!session ? (
                        isConfigured ? (
                        <button
                          type="button"
                          onClick={openAccountDialog}
                          className="inline-flex items-center justify-center rounded-full bg-[#153b66] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f2f53]"
                        >
                          {isRTL ? 'سجّل بالإيميل' : 'Sign in with email'}
                        </button>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-full border border-[#153b66]/15 bg-white px-5 py-3 text-sm font-bold text-[#153b66]">
                            {isRTL ? 'الطلب كضيف مفعّل الآن' : 'Guest checkout is active now'}
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={openAccountDialog}
                          className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100/60"
                        >
                          {isRTL ? 'فتح الحساب' : 'Open account'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Riyadh Only Banner */}
                  <div className="bg-[#153b66]/5 border border-[#153b66]/10 p-4 rounded-3xl flex items-center gap-4">
                    <div className="w-9 h-9 bg-white rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 sm:w-10 sm:h-10">
                      <MapPin className="w-4 h-4 text-[#153b66] sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{isRTL ? 'تغطية الرياض فقط' : 'Riyadh Coverage Only'}</p>
                    <p className="text-xs text-gray-400">{isRTL ? 'نحن متخصصون في توصيل الرياض بأسرع وقت' : 'Specialized Riyadh fast delivery service'}</p>
                    <p className="mt-1 text-xs font-bold text-[#153b66]">
                      {isRTL
                        ? `الحد الأدنى ${MIN_DELIVERY_CARTONS} كراتين، والتوصيل مجاني من ${FREE_DELIVERY_CARTONS} كرتونة.`
                        : `Minimum ${MIN_DELIVERY_CARTONS} cartons. Free delivery from ${FREE_DELIVERY_CARTONS} cartons.`}
                    </p>
                  </div>
                </div>

                  <div className="rounded-[2rem] border-2 border-emerald-200 bg-emerald-50/90 p-5 shadow-lg shadow-emerald-100/40">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-emerald-700">
                          {isRTL ? '\u0637\u0631\u0642 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0645\u062a\u0627\u062d\u0629' : 'Available payment methods'}
                        </p>
                        <h2 className="mt-1 text-xl font-black text-gray-900">
                          {selectedPaymentMethodLabel}
                        </h2>
                        <p className="mt-2 text-sm font-semibold leading-7 text-gray-600">
                          {isRTL
                            ? '\u0627\u062e\u062a\u0631 \u0643\u0627\u0634 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645\u060c \u0623\u0648 \u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a\u060c \u0623\u0648 \u0634\u0628\u0643\u0629 \u0645\u0639 \u0627\u0644\u0645\u0646\u062f\u0648\u0628. \u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631 \u0633\u064a\u0635\u0644 \u0644\u0646\u0627 \u0641\u064a \u0631\u0633\u0627\u0644\u0629 \u0648\u0627\u062a\u0633\u0627\u0628.'
                            : 'Choose cash on delivery, bank transfer, or a card machine with the delivery representative. The choice will be sent in WhatsApp.'}
                        </p>
                      </div>
                      {paymentMethod === 'bank_transfer' ? (
                        <div className="rounded-2xl bg-white p-4 text-sm shadow-sm sm:min-w-[17rem]">
                          <p className="font-black text-[#153b66]">
                            {isRTL ? BANK_TRANSFER_DETAILS.bankNameAr : BANK_TRANSFER_DETAILS.bankNameEn}
                          </p>
                          <p className="mt-2 text-xs font-bold text-gray-500">IBAN</p>
                          <p dir="ltr" className="mt-1 break-all text-base font-black text-gray-900">
                            {BANK_TRANSFER_DETAILS.iban}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-gray-200/30 border border-gray-100 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500">{isRTL ? 'الاسم بالكامل' : 'Full Name'}</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full h-16 rounded-2xl bg-gray-50 border border-gray-100 px-6 text-lg font-bold focus:border-[#153b66] outline-none transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500">{isRTL ? 'رقم الهاتف (واتساب)' : 'Phone (WhatsApp)'}</label>
                        <input type="tel" dir="ltr" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="966 50 000 0000" className="w-full h-16 rounded-2xl bg-gray-50 border border-gray-100 px-6 text-lg font-bold focus:border-[#153b66] outline-none transition-all" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                         <h3 className="text-lg font-bold text-gray-800">{isRTL ? 'عنوان التوصيل' : 'Delivery Address'}</h3>
                         <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={getUserLocation} className="flex-1 sm:flex-none h-12 px-4 bg-sky-50 text-[#153b66] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-sky-100 transition-all">
                               {isLocating ? <div className="w-4 h-4 border-2 border-[#153b66] border-t-transparent rounded-full animate-spin" /> : <Locate className="w-4 h-4" />}
                               {isRTL ? 'موقعي الحالي' : 'Current Location'}
                            </button>
                            <button onClick={() => setShowMap(!showMap)} className={`flex-1 sm:flex-none h-12 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${showMap ? 'bg-[#153b66] text-white' : 'bg-gray-100 text-gray-600'}`}>
                               <Navigation className="w-4 h-4" />
                               {isRTL ? 'اكتشف الخريطة' : 'Explore Map'}
                            </button>
                         </div>
                      </div>

                      {showMap && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 350, opacity: 1 }} className="w-full rounded-3xl overflow-hidden shadow-inner bg-gray-100 relative group">
                          <div ref={mapContainerRef} className="w-full h-full z-0" />
                          {!isLeafletReady && !mapLoadError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/65 backdrop-blur-sm">
                              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg">
                                <div className="h-5 w-5 rounded-full border-2 border-[#153b66] border-t-transparent animate-spin" />
                                <span className="text-sm font-bold text-gray-700">
                                  {isRTL ? 'جارٍ تحميل الخريطة...' : 'Loading map...'}
                                </span>
                              </div>
                            </div>
                          )}
                          {mapLoadError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm px-6 text-center">
                              <p className="max-w-sm text-sm font-semibold text-red-600">{mapLoadError}</p>
                            </div>
                          )}
                          <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
                             <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-white/20 flex items-center gap-3">
                                <Search className="w-4 h-4 text-[#153b66]" />
                                <span className="text-xs font-bold text-gray-600">{isRTL ? 'حرك العلامة لتحديد الموقع بدقة' : 'Drag marker to set exact location'}</span>
                             </div>
                          </div>
                        </motion.div>
                      )}

                      <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder={isRTL ? 'يرجى كتابة العنوان بالتفصيل (الحي، الشارع، رقم الشقة)' : 'Detailed address (District, Street, Villa/Apt num)'} className="w-full h-32 p-6 rounded-2xl bg-gray-50 border border-gray-100 text-lg font-medium focus:border-[#153b66] outline-none transition-all resize-none shadow-sm" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-500">
                        {isRTL ? 'الدور ورسوم التوصيل الإضافية' : 'Floor and extra delivery fee'}
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {DELIVERY_FLOOR_OPTIONS.map((option) => {
                          const selected = formData.floorLevel === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, floorLevel: option.id })}
                              className={`rounded-2xl border px-4 py-3 text-start transition-all ${
                                selected
                                  ? 'border-[#153b66] bg-[#153b66] text-white shadow-lg shadow-[#153b66]/15'
                                  : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-[#153b66]/30 hover:bg-[#edf4fa]'
                              }`}
                            >
                              <span className="block text-sm font-black">
                                {isRTL ? option.labelAr : option.labelEn}
                              </span>
                              <span className={`mt-1 block text-xs font-bold ${selected ? 'text-white/75' : 'text-gray-500'}`}>
                                {option.fee === null
                                  ? (isRTL ? 'يتم الاتفاق حسب حالة الموقع' : 'Quoted by site conditions')
                                  : option.fee === 0
                                    ? (isRTL ? 'بدون رسوم إضافية' : 'No extra fee')
                                    : formatSarPrice(option.fee, isRTL)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {needsFloorAgreement ? (
                        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold leading-7 text-amber-700">
                          {isRTL
                            ? 'للأدوار الأعلى من الثاني يتم الاتفاق على الرسوم حسب حالة الموقع قبل تأكيد التوصيل.'
                            : 'For floors above the second, the extra fee is agreed according to site conditions before delivery confirmation.'}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-[1.7rem] border border-[#153b66]/10 bg-[#edf4fa]/70 p-4">
                      <h3 className="mb-3 text-sm font-black text-[#153b66]">
                        {isRTL ? 'سياسة الطلب والتوصيل' : 'Order and delivery policy'}
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {deliveryPolicy.map((item) => (
                          <div key={item} className="flex gap-2 text-xs leading-6 text-gray-600">
                            <CheckCircle2 className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-[#153b66]" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-500">
                        {isRTL ? '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639' : 'Payment method'}
                      </label>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {MANUAL_PAYMENT_METHODS.map((option) => {
                          const selected = paymentMethod === option.id;
                          const Icon = paymentMethodIcons[option.id];

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setPaymentMethod(option.id)}
                              className={`min-h-[9.5rem] rounded-2xl border px-4 py-4 text-start transition-all ${
                                selected
                                  ? 'border-[#153b66] bg-[#153b66] text-white shadow-lg shadow-[#153b66]/15'
                                  : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-[#153b66]/30 hover:bg-[#edf4fa]'
                              }`}
                            >
                              <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${selected ? 'bg-white/15 text-white' : 'bg-white text-[#153b66]'}`}>
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="block text-sm font-black">
                                {isRTL ? option.labelAr : option.labelEn}
                              </span>
                              <span className={`mt-2 block text-xs font-semibold leading-6 ${selected ? 'text-white/75' : 'text-gray-500'}`}>
                                {isRTL ? option.descriptionAr : option.descriptionEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {paymentMethod === 'bank_transfer' ? (
                        <div className="grid gap-3 rounded-[1.5rem] border border-emerald-100 bg-emerald-50 p-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-bold text-emerald-700">
                              {isRTL ? '\u0627\u0644\u0628\u0646\u0643' : 'Bank'}
                            </p>
                            <p className="mt-1 text-sm font-black text-gray-900">
                              {isRTL ? BANK_TRANSFER_DETAILS.bankNameAr : BANK_TRANSFER_DETAILS.bankNameEn}
                            </p>
                          </div>
                          <div dir="ltr">
                            <p className="text-xs font-bold text-emerald-700">
                              {isRTL ? '\u0631\u0642\u0645 \u0627\u0644\u062d\u0633\u0627\u0628' : 'Account number'}
                            </p>
                            <p className="mt-1 break-all text-sm font-black text-gray-900">
                              {BANK_TRANSFER_DETAILS.accountNumber}
                            </p>
                          </div>
                          <div className="sm:col-span-2" dir="ltr">
                            <p className="text-xs font-bold text-emerald-700">IBAN</p>
                            <p className="mt-1 break-all text-base font-black text-[#153b66]">
                              {BANK_TRANSFER_DETAILS.iban}
                            </p>
                          </div>
                          <p className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-black leading-7 text-emerald-800 sm:col-span-2">
                            {isRTL
                              ? '\u0628\u0631\u062c\u0627\u0621 \u0625\u0631\u0633\u0627\u0644 \u0635\u0648\u0631\u0629 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0639\u0644\u0649 \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u0639\u062f \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u062a\u062d\u0648\u064a\u0644.'
                              : 'Please send a receipt photo on WhatsApp after completing the transfer.'}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {isWhatsAppCheckout ? (
                      <div className="rounded-[1.7rem] border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-bold leading-7 text-green-700">
                        {isRTL
                          ? 'أكمل بياناتك أولاً، ثم أرسل الطلب عبر واتساب وسيصل لنا الاسم والجوال والعنوان مع تفاصيل السلة.'
                          : 'Complete your details first, then send the order on WhatsApp with your name, phone, address, and cart details.'}
                      </div>
                    ) : null}

                    <button
                      onClick={isWhatsAppCheckout ? handleWhatsAppOrder : handleNextStep}
                      disabled={!canSubmitCustomerDetails}
                      className="w-full h-20 bg-gradient-to-r from-[#153b66] to-[#2b648c] text-white rounded-[1.7rem] font-black text-xl hover:shadow-2xl transition-all disabled:opacity-30"
                    >
                      {isWhatsAppCheckout
                        ? (isRTL ? 'إرسال الطلب عبر واتساب' : 'Send order via WhatsApp')
                        : (isRTL ? 'متابعة تأكيد الطلب' : 'Continue order confirmation')}
                    </button>
                    {!isWhatsAppCheckout ? (
                      <button
                        type="button"
                        onClick={handleWhatsAppOrder}
                        disabled={!canSubmitCustomerDetails}
                        className="w-full h-16 rounded-[1.4rem] border-2 border-green-200 bg-green-50 font-black text-green-700 transition-all hover:bg-green-100 disabled:opacity-30"
                      >
                        {isRTL ? 'إرسال الطلب عبر واتساب' : 'Send order via WhatsApp'}
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="rounded-[2rem] border border-[#153b66]/10 bg-white p-5 shadow-lg shadow-gray-200/30 sm:p-6">
                    <div className="mb-4">
                      <p className="text-sm font-black text-[#153b66]">
                        {isRTL ? '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0645\u062e\u062a\u0627\u0631\u0629' : 'Selected payment method'}
                      </p>
                      <h2 className="mt-1 text-xl font-black text-gray-900">
                        {selectedPaymentMethodLabel}
                      </h2>
                    </div>
                    <div className={paymentMethod === 'bank_transfer' ? 'grid gap-3 sm:grid-cols-2' : 'hidden'}>
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs font-bold text-gray-500">{isRTL ? 'اسم صاحب الحساب' : 'Account holder'}</p>
                        <p className="mt-2 text-sm font-black leading-6 text-gray-900">
                          {isRTL ? BANK_TRANSFER_DETAILS.accountNameAr : BANK_TRANSFER_DETAILS.accountNameEn}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4" dir="ltr">
                        <p className="text-xs font-bold text-gray-500">{isRTL ? 'رقم الحساب' : 'Account number'}</p>
                        <p className="mt-2 break-all text-sm font-black text-gray-900">{BANK_TRANSFER_DETAILS.accountNumber}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4 sm:col-span-2" dir="ltr">
                        <p className="text-xs font-bold text-gray-500">IBAN</p>
                        <p className="mt-2 break-all text-base font-black text-[#153b66]">{BANK_TRANSFER_DETAILS.iban}</p>
                      </div>
                      <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black leading-7 text-emerald-800 sm:col-span-2">
                        {isRTL
                          ? '\u0628\u0631\u062c\u0627\u0621 \u0625\u0631\u0633\u0627\u0644 \u0635\u0648\u0631\u0629 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0639\u0644\u0649 \u0648\u0627\u062a\u0633\u0627\u0628 \u0628\u0639\u062f \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u062a\u062d\u0648\u064a\u0644.'
                          : 'Please send a receipt photo on WhatsApp after completing the transfer.'}
                      </p>
                    </div>
                    {paymentMethod !== 'bank_transfer' ? (
                      <div className="rounded-2xl bg-gray-50 p-4 text-sm font-semibold leading-7 text-gray-600">
                        {paymentMethod === 'pos_on_delivery'
                          ? (isRTL
                              ? '\u0633\u064a\u062a\u0645 \u062a\u062c\u0647\u064a\u0632 \u0645\u0646\u062f\u0648\u0628 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0628\u0645\u0643\u064a\u0646\u0629 \u0634\u0628\u0643\u0629 \u0644\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0648\u0635\u0648\u0644 \u0627\u0644\u0637\u0644\u0628.'
                              : 'The delivery representative will bring a card machine when the order arrives.')
                          : (isRTL
                              ? '\u0633\u064a\u062a\u0645 \u0627\u0644\u062f\u0641\u0639 \u0643\u0627\u0634 \u0644\u0645\u0646\u062f\u0648\u0628 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0639\u0646\u062f \u0648\u0635\u0648\u0644 \u0627\u0644\u0637\u0644\u0628.'
                              : 'Payment will be collected in cash by the delivery representative when the order arrives.')}
                      </div>
                    ) : null}
                    <p className="mt-4 text-sm font-semibold leading-7 text-gray-500">
                      {isRTL
                        ? paymentMethod === 'bank_transfer'
                          ? '\u0627\u0636\u063a\u0637 \u0625\u0631\u0633\u0627\u0644 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628\u060c \u0648\u0628\u0639\u062f \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0628\u0631\u062c\u0627\u0621 \u0625\u0631\u0633\u0627\u0644 \u0635\u0648\u0631\u0629 \u0625\u064a\u0635\u0627\u0644 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0644\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628.'
                          : '\u0627\u0636\u063a\u0637 \u0625\u0631\u0633\u0627\u0644 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628 \u0644\u064a\u0635\u0644\u0646\u0627 \u0627\u0644\u0637\u0644\u0628 \u0645\u0639 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0645\u062e\u062a\u0627\u0631\u0629.'
                        : 'Send via WhatsApp so we receive the order with the selected payment method.'}
                    </p>
                  </div>
                  <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-gray-200/30 border border-gray-100 overflow-hidden">
                    <div className="rounded-[1.7rem] border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-semibold leading-7 text-amber-800">
                      {isRTL
                        ? '\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0645\u062a\u0648\u0642\u0641\u0629 \u0645\u0624\u0642\u062a\u064b\u0627. \u0633\u0646\u0624\u0643\u062f \u0627\u0644\u0637\u0644\u0628 \u064a\u062f\u0648\u064a\u064b\u0627 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628 \u062d\u0633\u0628 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u062a\u064a \u0627\u062e\u062a\u0631\u062a\u0647\u0627.'
                        : 'Online gateway payments are paused temporarily. We will manually confirm the order on WhatsApp using your selected payment method.'}
                    </div>
                    <button
                      type="button"
                      onClick={handleWhatsAppOrder}
                      className="mt-5 w-full rounded-[1.7rem] bg-green-600 px-5 py-5 text-lg font-black text-white transition hover:bg-green-700 hover:shadow-2xl"
                    >
                      {isRTL ? '\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628' : 'Send order on WhatsApp'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-3 w-full rounded-[1.4rem] border-2 border-[#153b66]/10 bg-white px-5 py-4 font-black text-[#153b66] transition hover:bg-[#edf4fa]"
                    >
                      {isRTL ? '\u062a\u0639\u062f\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u0648\u0635\u064a\u0644' : 'Edit delivery details'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden">
               <h3 className="text-xl font-black mb-8 border-b border-white/10 pb-4">
                 {isRTL
                   ? `ملخص الطلب (${totalItems} منتج / ${totalCartons} كرتون)`
                   : `Order Summary (${totalItems} items / ${totalCartons} cartons)`}
               </h3>
               <div className="space-y-4 max-h-[40vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 p-1 border border-white/10 flex-shrink-0">
                        <ProductImage product={item.product} isRTL={isRTL} size="thumb" />
                      </div>
                      <div className="flex-1"><h4 className="text-sm font-bold line-clamp-1">{isRTL ? item.product.name.ar : item.product.name.en}</h4><p className="text-xs text-white/40 mt-1">{item.quantity} x {formatSarPrice(item.product.price, isRTL)}</p></div>
                      <div className="font-bold text-[#2b648c]">{formatSarPrice((item.product.price ?? 0) * item.quantity, isRTL)}</div>
                    </div>
                  ))}
               </div>
               <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
                  <div className="flex justify-between text-white/50 text-sm"><span>{isRTL ? 'المجموع' : 'Subtotal'}</span><span>{formatSarPrice(totalPrice, isRTL)}</span></div>
                  <div className="flex justify-between text-white/50 text-sm"><span>{isRTL ? 'التوصيل' : 'Delivery'}</span><span className={deliveryFee === 0 ? 'text-green-400' : ''}>{deliveryFee === 0 ? isRTL ? 'مجاني' : 'Free' : formatSarPrice(deliveryFee, isRTL)}</span></div>
                  <div className="flex justify-between text-white/50 text-sm">
                    <span>{isRTL ? 'رسوم الدور' : 'Floor fee'}</span>
                    <span className={floorDeliveryFee === 0 && !needsFloorAgreement ? 'text-green-400' : ''}>
                      {needsFloorAgreement
                        ? (isRTL ? 'بالاتفاق' : 'By agreement')
                        : floorDeliveryFee === 0
                          ? (isRTL ? 'بدون رسوم' : 'No fee')
                          : formatSarPrice(floorDeliveryFee, isRTL)}
                    </span>
                  </div>
                  {!deliveryRule.hasFreeDelivery && (
                    <div className="rounded-2xl bg-white/5 px-3 py-2 text-xs leading-6 text-white/55">
                      {isRTL
                        ? `أضف ${deliveryRule.cartonsToFreeDelivery} كرتونة للتوصيل المجاني.`
                        : `Add ${deliveryRule.cartonsToFreeDelivery} cartons for free delivery.`}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10"><span className="text-2xl font-black">{isRTL ? 'الإجمالي' : 'Total'}</span><span className="text-3xl font-black text-[#2b648c]">{formatSarPrice(finalTotal, isRTL)}</span></div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
