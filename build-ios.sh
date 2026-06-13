#!/bin/bash
# 📱 iOS Build Script - الكل في سطر واحد!

# هذا الملف يبسط عملية البناء والنشر للـ iOS

# الألوان للطباعة الملونة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# الدوال المساعدة
print_step() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# التحقق من أن EAS مثبتة
check_eas() {
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI غير مثبتة!"
        echo "ثبتها بـ: npm install -g eas-cli"
        exit 1
    fi
}

# الخطوة 1: الإعداد الأول
setup() {
    print_step "الإعداد الأول لـ iOS Build"
    
    cd mobile || exit 1
    
    print_warning "تأكد من أن لديك:"
    echo "1. حساب Expo (https://expo.dev)"
    echo "2. Apple Developer Account (اختياري الآن)"
    echo ""
    
    echo "ابدأ بـ:"
    echo "1. eas login"
    echo "2. eas project:init"
    echo "3. eas credentials"
}

# الخطوة 2: بناء التطبيق
build() {
    print_step "بناء تطبيق iOS الأصلي"
    
    cd mobile || exit 1
    check_eas
    
    echo "هذا سيستغرق 15-20 دقيقة..."
    echo ""
    
    npx eas-cli build -p ios --profile production
    
    print_step "✅ تم البناء بنجاح!"
    echo "شاهد البناء هنا: https://expo.io/dashboard"
}

# الخطوة 3: اختبار التطبيق
preview() {
    print_step "بناء نسخة اختبار (Preview)"
    
    cd mobile || exit 1
    check_eas
    
    npx eas-cli build -p ios --profile preview --auto-submit
    
    print_step "✅ تم الاختبار بنجاح!"
    echo "شارك الرابط مع الفريق للاختبار"
}

# الخطوة 4: النشر على App Store
submit() {
    print_step "نشر على App Store"
    
    cd mobile || exit 1
    check_eas
    
    print_warning "تأكد من:"
    echo "1. البناء انتهى بنجاح"
    echo "2. أنت متسجل في EAS"
    echo "3. لديك Apple Developer Account"
    echo ""
    
    read -p "هل تريد المتابعة؟ (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "تم الإلغاء"
        return
    fi
    
    npx eas-cli submit -p ios --latest
    
    print_step "✅ تم النشر على App Store!"
    echo "المراجعة من Apple تستغرق 1-3 أيام"
}

# الخطوة 5: دورة حياة كاملة
full_cycle() {
    print_step "دورة البناء الكاملة"
    
    cd mobile || exit 1
    check_eas
    
    # تحديث الإصدار
    print_step "تحديث رقم الإصدار"
    # يمكنك تحديث app.config.ts هنا
    
    # البناء
    print_step "بناء التطبيق"
    npm run build:ios
    
    # الانتظار
    print_step "انتظر انتهاء البناء"
    echo "شاهد الحالة: https://expo.io/dashboard"
    
    # النشر
    read -p "هل البناء انتهى؟ (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run submit:ios
        print_step "✅ تم النشر!"
    fi
}

# القائمة الرئيسية
show_menu() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📱 متجر ريق - iOS Build Tool${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "اختر خياراً:"
    echo "1) الإعداد الأول (setup)"
    echo "2) بناء التطبيق (build)"
    echo "3) اختبار التطبيق (preview)"
    echo "4) نشر على App Store (submit)"
    echo "5) دورة كاملة (full cycle)"
    echo "6) خروج (exit)"
    echo ""
    read -p "اختيارك: " choice
}

# المعالج الرئيسي
main() {
    while true; do
        show_menu
        
        case $choice in
            1) setup ;;
            2) build ;;
            3) preview ;;
            4) submit ;;
            5) full_cycle ;;
            6) 
                print_step "وداعاً! 👋"
                exit 0
                ;;
            *)
                print_error "خيار غير صحيح!"
                ;;
        esac
        
        echo ""
        read -p "اضغط Enter للمتابعة..."
    done
}

# تشغيل البرنامج
main
