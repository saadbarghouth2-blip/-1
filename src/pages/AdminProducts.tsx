import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Edit3,
  ImagePlus,
  Lock,
  PackagePlus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useWebAuth } from '../features/auth/WebAuthProvider';
import {
  getBlankProductInput,
  getCatalogGroupIdForAdminSize,
  isCurrentUserProductAdmin,
  listAdminProducts,
  makeProductInputFromProduct,
  PRODUCT_ADMIN_EMAIL,
  createProduct,
  deleteProduct,
  updateProduct,
  uploadProductImage,
  type ProductInput,
} from '../services/productAdmin';
import { catalogGroups, productSizeOptions, products as fallbackProducts, type Product } from '../data/products';
import { useProductCatalog } from '../features/catalog/ProductCatalogProvider';
import ProductImage from '../components/ProductImage';
import { cn, formatSarPrice } from '../lib/utils';

const categoryOptions: Array<{ id: Product['category']; label: string }> = [
  { id: 'small', label: 'عبوة صغيرة' },
  { id: 'medium', label: 'عبوة متوسطة' },
  { id: 'large', label: 'عبوة كبيرة' },
  { id: 'gallon', label: 'جالون' },
  { id: 'glass', label: 'زجاج' },
  { id: 'offer', label: 'عرض' },
];

const imageTypeOptions: Array<NonNullable<Product['imageType']>> = ['case', 'offer', 'bottle', 'gallon'];
const imageFitOptions: Array<NonNullable<Product['imageFit']>> = ['relaxed', 'balanced', 'tight', 'portrait'];

function makeEditableProduct(input: ProductInput): Product {
  return {
    id: input.id || 'preview',
    brandId: input.brandId || 'brand',
    brand: input.brand || 'Brand',
    brandAr: input.brandAr || 'العلامة',
    name: {
      en: input.nameEn || 'Product preview',
      ar: input.nameAr || 'معاينة المنتج',
    },
    category: input.category,
    catalogGroup: input.catalogGroup,
    size: input.size,
    quantity: input.quantity,
    ...(typeof input.price === 'number' ? { price: input.price } : {}),
    ...(typeof input.originalPrice === 'number' ? { originalPrice: input.originalPrice } : {}),
    pricingMode: input.pricingMode,
    isPurchasable: input.pricingMode === 'fixed' && typeof input.price === 'number',
    ...(input.image ? { image: input.image } : {}),
    description: {
      en: input.descriptionEn || 'Product description',
      ar: input.descriptionAr || 'وصف المنتج',
    },
    features: [],
    benefits: [],
    specifications: {},
    inStock: input.inStock,
    rating: 0,
    reviews: 0,
    imageType: input.imageType ?? 'case',
    imageFit: input.imageFit ?? 'balanced',
    catalogOrder: input.catalogOrder,
  };
}

function numberOrNull(value: FormDataEntryValue | null) {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function AdminProducts() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const {
    authReady,
    isConfigured,
    configError,
    session,
    requestEmailOtp,
    confirmEmailOtp,
    signOut,
  } = useWebAuth();
  const { refreshProducts } = useProductCatalog();
  const [email, setEmail] = useState(PRODUCT_ADMIN_EMAIL);
  const [token, setToken] = useState('');
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | Product['catalogGroup']>('all');
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(getBlankProductInput);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAdminProducts = async () => {
    setIsBusy(true);
    setError(null);
    try {
      setProducts(await listAdminProducts());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'تعذر تحميل المنتجات.');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    if (!authReady || !session?.email || !isConfigured) {
      setIsAdmin(false);
      return;
    }

    let active = true;
    setIsCheckingAdmin(true);
    void isCurrentUserProductAdmin(session.email)
      .then((allowed) => {
        if (!active) {
          return;
        }

        setIsAdmin(allowed);
        if (allowed) {
          void loadAdminProducts();
        }
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }
        setError(nextError instanceof Error ? nextError.message : 'تعذر التحقق من صلاحية الإدارة.');
        setIsAdmin(false);
      })
      .finally(() => {
        if (active) {
          setIsCheckingAdmin(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authReady, isConfigured, session?.email]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !needle ||
        product.name.ar.toLowerCase().includes(needle) ||
        product.name.en.toLowerCase().includes(needle) ||
        product.brand.toLowerCase().includes(needle) ||
        product.brandAr.toLowerCase().includes(needle) ||
        product.id.toLowerCase().includes(needle);
      const matchesGroup = groupFilter === 'all' || product.catalogGroup === groupFilter;
      const isPublished = product.isPublished ?? true;
      const matchesPublished = publishFilter === 'all' ||
        (publishFilter === 'published' && isPublished) ||
        (publishFilter === 'hidden' && !isPublished);

      return matchesQuery && matchesGroup && matchesPublished;
    });
  }, [groupFilter, products, publishFilter, query]);

  const startCreate = () => {
    setEditingId(null);
    setForm(getBlankProductInput());
    setImageFile(null);
    setMessage(null);
    setError(null);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm(makeProductInputFromProduct(product));
    setImageFile(null);
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginRequest = async (event: FormEvent) => {
    event.preventDefault();
    setIsBusy(true);
    setError(null);
    try {
      await requestEmailOtp(email);
      setLoginStep('otp');
      setMessage('تم إرسال كود الدخول على الإيميل. افتح الرسالة واكتب الكود هنا.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'تعذر إرسال كود الدخول.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleOtpConfirm = async (event: FormEvent) => {
    event.preventDefault();
    setIsBusy(true);
    setError(null);
    try {
      await confirmEmailOtp(email, token);
      setMessage('تم تسجيل الدخول بنجاح.');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'الكود غير صحيح أو انتهت صلاحيته.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsBusy(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const nextForm: ProductInput = {
      ...form,
      id: String(formData.get('id') ?? '').trim(),
      brandId: String(formData.get('brandId') ?? '').trim(),
      brand: String(formData.get('brand') ?? '').trim(),
      brandAr: String(formData.get('brandAr') ?? '').trim(),
      nameEn: String(formData.get('nameEn') ?? '').trim(),
      nameAr: String(formData.get('nameAr') ?? '').trim(),
      category: String(formData.get('category')) as Product['category'],
      catalogGroup: String(formData.get('catalogGroup')) as Product['catalogGroup'],
      size: String(formData.get('size') ?? '').trim(),
      quantity: Number(formData.get('quantity') ?? 0),
      price: numberOrNull(formData.get('price')),
      originalPrice: numberOrNull(formData.get('originalPrice')),
      pricingMode: String(formData.get('pricingMode')) as Product['pricingMode'],
      image: String(formData.get('image') ?? '').trim() || null,
      descriptionEn: String(formData.get('descriptionEn') ?? '').trim(),
      descriptionAr: String(formData.get('descriptionAr') ?? '').trim(),
      inStock: formData.get('inStock') === 'on',
      isPublished: formData.get('isPublished') === 'on',
      catalogOrder: Number(formData.get('catalogOrder') ?? 0),
      imageType: String(formData.get('imageType')) as Product['imageType'],
      imageFit: String(formData.get('imageFit')) as Product['imageFit'],
    };

    if (!nextForm.id || !nextForm.brand || !nextForm.brandAr || !nextForm.nameEn || !nextForm.nameAr) {
      setError('املأ كود المنتج، اسم المنتج، وبيانات العلامة.');
      setIsBusy(false);
      return;
    }

    try {
      if (imageFile) {
        nextForm.image = await uploadProductImage(imageFile, nextForm.id);
      }

      if (editingId) {
        await updateProduct(editingId, nextForm);
        setMessage('تم حفظ تعديل المنتج.');
      } else {
        await createProduct(nextForm);
        setMessage('تم إضافة المنتج.');
      }

      setForm(nextForm);
      setImageFile(null);
      await loadAdminProducts();
      await refreshProducts();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'تعذر حفظ المنتج.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`حذف ${product.name.ar}؟`);
    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setError(null);
    try {
      await deleteProduct(product.id);
      setMessage('تم حذف المنتج.');
      if (editingId === product.id) {
        startCreate();
      }
      await loadAdminProducts();
      await refreshProducts();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'تعذر حذف المنتج.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImportCurrentCatalog = async () => {
    const existingIds = new Set(products.map((product) => product.id));
    const missingProducts = fallbackProducts.filter((product) => !existingIds.has(product.id));
    if (missingProducts.length === 0) {
      setMessage('كل منتجات الكتالوج الحالي موجودة بالفعل في Supabase.');
      return;
    }

    const confirmed = window.confirm(`استيراد ${missingProducts.length} منتج من الكتالوج الحالي إلى Supabase؟`);
    if (!confirmed) {
      return;
    }

    setIsBusy(true);
    setError(null);
    setMessage(null);
    try {
      for (const product of missingProducts) {
        await createProduct(makeProductInputFromProduct(product));
      }

      setMessage('تم استيراد الكتالوج الحالي إلى Supabase.');
      await loadAdminProducts();
      await refreshProducts();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'تعذر استيراد الكتالوج الحالي.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleQuickSizeChange = (size: string) => {
    setForm((current) => ({
      ...current,
      size,
      catalogGroup: getCatalogGroupIdForAdminSize(size),
      category: size === '200ml' ? 'small' : size === '330ml' ? 'medium' : 'large',
    }));
  };

  if (!isConfigured) {
    return (
      <main className="relative z-10 min-h-screen py-24">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <Lock className="mb-3 h-7 w-7" />
          <h1 className="text-2xl font-black">لوحة الإدارة غير متاحة</h1>
          <p className="mt-3 text-sm leading-7">{configError}</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="relative z-10 min-h-screen py-20">
        <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.35)]">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#153b66]/10 text-[#153b66]">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900">دخول إدارة المنتجات</h1>
              <p className="text-sm text-slate-500">مسموح فقط للإيميل المحدد.</p>
            </div>
          </div>

          <form onSubmit={loginStep === 'email' ? handleLoginRequest : handleOtpConfirm} className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">{loginStep === 'email' ? 'الإيميل' : 'كود الدخول'}</span>
              <input
                value={loginStep === 'email' ? email : token}
                onChange={(event) => {
                  if (loginStep === 'email') {
                    setEmail(event.target.value);
                    return;
                  }

                  setToken(event.target.value.replace(/\D/g, '').slice(0, 6));
                }}
                type={loginStep === 'email' ? 'email' : 'text'}
                inputMode={loginStep === 'email' ? 'email' : 'numeric'}
                autoComplete={loginStep === 'email' ? 'email' : 'one-time-code'}
                maxLength={loginStep === 'email' ? undefined : 6}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right outline-none focus:border-[#153b66] focus:ring-4 focus:ring-[#153b66]/10"
                placeholder={loginStep === 'email' ? PRODUCT_ADMIN_EMAIL : '123456'}
              />
            </label>
            {loginStep === 'otp' ? (
              <button
                type="button"
                onClick={() => {
                  setLoginStep('email');
                  setToken('');
                  setMessage(null);
                  setError(null);
                }}
                className="text-sm font-bold text-[#153b66]"
              >
                تغيير الإيميل أو إعادة إرسال الكود
              </button>
            ) : null}
            {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p> : null}
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#153b66] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loginStep === 'email' ? 'إرسال الكود' : 'تأكيد الكود'}</span>
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (isCheckingAdmin || !authReady) {
    return (
      <main className="relative z-10 flex min-h-screen items-center justify-center py-20">
        <div className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#153b66] shadow-lg">
          جاري التحقق من صلاحية الإدارة...
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="relative z-10 min-h-screen py-20">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-red-100 bg-white p-6 text-center shadow-[0_24px_70px_-44px_rgba(15,23,42,0.35)]">
          <Lock className="mx-auto h-8 w-8 text-red-600" />
          <h1 className="mt-4 text-2xl font-black text-slate-900">غير مصرح لهذا الحساب</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            الحساب الحالي {session.email} لا يملك صلاحية تعديل المنتجات.
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white"
          >
            تسجيل الخروج
          </button>
        </div>
      </main>
    );
  }

  const previewProduct = makeEditableProduct(form);

  return (
    <main className="relative z-10 min-h-screen py-16 sm:py-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <section className="rounded-[2rem] bg-[#153b66] p-5 text-white shadow-[0_28px_80px_-42px_rgba(21,59,102,0.62)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold">Admin</div>
              <h1 className="mt-3 text-3xl font-black">إدارة المنتجات</h1>
              <p className="mt-2 text-sm leading-7 text-white/75">
                أضف وعدل واحذف المنتجات من هنا. أي منتج منشور يظهر في الكتالوج العام بعد الحفظ.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadAdminProducts()}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث
              </button>
              <button
                type="button"
                onClick={() => void handleImportCurrentCatalog()}
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                استيراد الحالي
              </button>
              <Link to="/products" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#153b66]">
                عرض الكتالوج
              </Link>
              <Link to="/admin" className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
                لوحة المبيعات
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white"
              >
                خروج
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.25)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">{editingId ? 'تعديل منتج' : 'إضافة منتج'}</h2>
                <p className="text-sm text-slate-500">{editingId ?? 'منتج جديد'}</p>
              </div>
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
              >
                <PackagePlus className="h-4 w-4" />
                جديد
              </button>
            </div>

            <ProductImage product={previewProduct} isRTL={isRTL} size="card" className="mb-5 h-52" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminInput name="id" label="كود المنتج" value={form.id} onChange={(value) => setForm((current) => ({ ...current, id: value }))} />
                <AdminInput name="catalogOrder" label="ترتيب العرض" type="number" value={String(form.catalogOrder)} onChange={(value) => setForm((current) => ({ ...current, catalogOrder: Number(value) }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminInput name="nameAr" label="اسم المنتج عربي" value={form.nameAr} onChange={(value) => setForm((current) => ({ ...current, nameAr: value }))} />
                <AdminInput name="nameEn" label="اسم المنتج إنجليزي" value={form.nameEn} onChange={(value) => setForm((current) => ({ ...current, nameEn: value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminInput name="brandAr" label="العلامة عربي" value={form.brandAr} onChange={(value) => setForm((current) => ({ ...current, brandAr: value }))} />
                <AdminInput name="brand" label="Brand EN" value={form.brand} onChange={(value) => setForm((current) => ({ ...current, brand: value }))} />
              </div>
              <AdminInput name="brandId" label="كود العلامة" value={form.brandId} onChange={(value) => setForm((current) => ({ ...current, brandId: value }))} />

              <div className="grid gap-3 sm:grid-cols-3">
                <AdminSelect name="size" label="المقاس" value={form.size} onChange={handleQuickSizeChange} options={productSizeOptions.map((option) => ({ value: option.id, label: option.labelEn }))} />
                <AdminSelect name="catalogGroup" label="القسم" value={form.catalogGroup} onChange={(value) => setForm((current) => ({ ...current, catalogGroup: value as Product['catalogGroup'] }))} options={catalogGroups.map((group) => ({ value: group.id, label: group.shortEn }))} />
                <AdminInput name="quantity" label="العدد" type="number" value={String(form.quantity)} onChange={(value) => setForm((current) => ({ ...current, quantity: Number(value) }))} />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <AdminSelect name="category" label="التصنيف" value={form.category} onChange={(value) => setForm((current) => ({ ...current, category: value as Product['category'] }))} options={categoryOptions.map((option) => ({ value: option.id, label: option.label }))} />
                <AdminSelect name="pricingMode" label="التسعير" value={form.pricingMode} onChange={(value) => setForm((current) => ({ ...current, pricingMode: value as Product['pricingMode'] }))} options={[{ value: 'fixed', label: 'سعر ثابت' }, { value: 'quote', label: 'اسأل عن السعر' }]} />
                <AdminInput name="price" label="السعر" type="number" step="0.01" value={form.price === null || form.price === undefined ? '' : String(form.price)} onChange={(value) => setForm((current) => ({ ...current, price: value ? Number(value) : null }))} />
              </div>
              <AdminInput name="originalPrice" label="السعر قبل الخصم" type="number" step="0.01" value={form.originalPrice === null || form.originalPrice === undefined ? '' : String(form.originalPrice)} onChange={(value) => setForm((current) => ({ ...current, originalPrice: value ? Number(value) : null }))} />

              <AdminTextarea name="descriptionAr" label="الوصف عربي" value={form.descriptionAr} onChange={(value) => setForm((current) => ({ ...current, descriptionAr: value }))} />
              <AdminTextarea name="descriptionEn" label="الوصف إنجليزي" value={form.descriptionEn} onChange={(value) => setForm((current) => ({ ...current, descriptionEn: value }))} />

              <AdminInput name="image" label="رابط الصورة" value={form.image ?? ''} onChange={(value) => setForm((current) => ({ ...current, image: value }))} />
              <label className="block rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 p-4">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <ImagePlus className="h-4 w-4" />
                  رفع صورة من الجهاز
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                  className="mt-3 w-full text-sm text-slate-600"
                />
                {imageFile ? <span className="mt-2 block text-xs font-semibold text-[#153b66]">{imageFile.name}</span> : null}
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <AdminSelect name="imageType" label="نوع الصورة" value={form.imageType ?? 'case'} onChange={(value) => setForm((current) => ({ ...current, imageType: value as Product['imageType'] }))} options={imageTypeOptions.map((value) => ({ value, label: value }))} />
                <AdminSelect name="imageFit" label="ملاءمة الصورة" value={form.imageFit ?? 'balanced'} onChange={(value) => setForm((current) => ({ ...current, imageFit: value as Product['imageFit'] }))} options={imageFitOptions.map((value) => ({ value, label: value }))} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <AdminCheckbox name="inStock" label="متوفر" checked={form.inStock} onChange={(checked) => setForm((current) => ({ ...current, inStock: checked }))} />
                <AdminCheckbox name="isPublished" label="منشور" checked={form.isPublished} onChange={(checked) => setForm((current) => ({ ...current, isPublished: checked }))} />
              </div>

              {message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p> : null}
              {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}

              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#153b66] px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {imageFile ? <Upload className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                حفظ المنتج
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.25)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">كل المنتجات</h2>
                <p className="text-sm text-slate-500">{filteredProducts.length} من {products.length} منتج</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_150px_150px]">
                <label className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="بحث..."
                    className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pr-10 pl-4 text-sm outline-none focus:border-[#153b66]"
                  />
                </label>
                <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value as typeof groupFilter)} className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm">
                  <option value="all">كل الأقسام</option>
                  {catalogGroups.map((group) => <option key={group.id} value={group.id}>{group.shortAr}</option>)}
                </select>
                <select value={publishFilter} onChange={(event) => setPublishFilter(event.target.value as typeof publishFilter)} className="h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm">
                  <option value="all">كل الحالات</option>
                  <option value="published">متوفر</option>
                  <option value="hidden">غير متوفر</option>
                </select>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className="max-h-[760px] overflow-auto">
                <table className="w-full min-w-[760px] text-right text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs font-black text-slate-500">
                    <tr>
                      <th className="px-4 py-3">المنتج</th>
                      <th className="px-4 py-3">القسم</th>
                      <th className="px-4 py-3">السعر</th>
                      <th className="px-4 py-3">الحالة</th>
                      <th className="px-4 py-3">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className={cn('bg-white', editingId === product.id && 'bg-[#153b66]/5')}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <ProductImage product={product} isRTL={isRTL} size="thumb" className="h-14 w-14 shrink-0" />
                            <div>
                              <div className="font-black text-slate-900">{product.name.ar}</div>
                              <div className="text-xs text-slate-500">{product.id} • {product.brandAr}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{product.size} x{product.quantity}</td>
                        <td className="px-4 py-3 font-bold text-[#153b66]">
                          {product.pricingMode === 'fixed' ? formatSarPrice(product.price, isRTL) : 'اسأل عن السعر'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('rounded-full px-3 py-1 text-xs font-bold', (product.isPublished ?? true) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                            {(product.isPublished ?? true) ? 'منشور' : 'مخفي'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startEdit(product)} className="rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-[#153b66] hover:text-white">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => void handleDelete(product)} className="rounded-full bg-red-50 p-2 text-red-700 hover:bg-red-600 hover:text-white">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AdminInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  step,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        step={step}
        className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#153b66] focus:bg-white focus:ring-4 focus:ring-[#153b66]/10"
      />
    </label>
  );
}

function AdminTextarea({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-1.5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#153b66] focus:bg-white focus:ring-4 focus:ring-[#153b66]/10"
      />
    </label>
  );
}

function AdminSelect({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#153b66] focus:bg-white focus:ring-4 focus:ring-[#153b66]/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function AdminCheckbox({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
        className="h-5 w-5 accent-[#153b66]"
      />
    </label>
  );
}
