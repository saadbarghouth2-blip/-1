import { useEffect } from 'react';

export default function Maintenance() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'الموقع متوقف مؤقتًا | متجر ريق';

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef6fc] px-5 py-10 text-[#153b66]"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(43,100,140,0.18),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(21,59,102,0.12),transparent_42%)]" />

      <section className="relative w-full max-w-xl rounded-[2rem] border border-white/90 bg-white/90 px-6 py-10 text-center shadow-[0_28px_90px_-38px_rgba(12,35,64,0.42)] backdrop-blur sm:px-10 sm:py-12">
        <img
          src="/icons/app-icon-192.png"
          alt="شعار متجر ريق"
          className="mx-auto h-24 w-24 rounded-[1.75rem] object-cover shadow-[0_16px_36px_-18px_rgba(21,59,102,0.7)] sm:h-28 sm:w-28"
          width="112"
          height="112"
        />

        <p className="mt-6 text-sm font-bold tracking-wide text-[#2b648c]">متجر ريق لتوصيل المياه</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#0c2340] sm:text-4xl">
          الموقع متوقف مؤقتًا
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base font-medium leading-8 text-slate-600 sm:text-lg">
          نعمل حاليًا على بعض التحديثات. شكرًا لتفهمكم، وستعود الخدمة قريبًا.
        </p>

        <div className="mx-auto mt-8 h-1.5 w-24 overflow-hidden rounded-full bg-[#dceaf5]">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-l from-[#153b66] to-[#4a8bb4]" />
        </div>
      </section>
    </main>
  );
}
