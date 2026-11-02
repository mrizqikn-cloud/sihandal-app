import Link from 'next/link';

export default function LandingPage() {
  // Array data untuk card agar kodenya lebih rapi dan bisa diberi warna unik
  const features = [
    { 
      title: "Standar (Alur Hibah)", 
      desc: "Menetapkan standar proses dan peran setiap pihak dalam pengelolaan hibah non tahapan.",
      color: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white"
    },
    { 
      title: "Cek (Checklist)", 
      desc: "Memverifikasi kelengkapan dokumen sejak awal proses permohonan hingga pelaporan.",
      color: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white"
    },
    { 
      title: "Tetapkan (PIC & Waktu)", 
      desc: "Menetapkan penanggung jawab dan target waktu yang jelas untuk setiap permohonan.",
      color: "text-violet-600 bg-violet-50 group-hover:bg-violet-600 group-hover:text-white"
    },
    { 
      title: "Pantau (Monitoring)", 
      desc: "Menampilkan status permohonan secara real-time kepada semua pihak terkait.",
      color: "text-amber-600 bg-amber-50 group-hover:bg-amber-600 group-hover:text-white"
    },
    { 
      title: "Peringatkan (Early Warning)", 
      desc: "Mendeteksi potensi keterlambatan sejak dini, sebelum batas waktu terlampaui.",
      color: "text-rose-600 bg-rose-50 group-hover:bg-rose-600 group-hover:text-white"
    },
    { 
      title: "Tindak Lanjut (Evaluasi)", 
      desc: "Menutup setiap kasus dengan catatan pembelajaran dan perbaikan.",
      color: "text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white"
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafcff] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navbar Modern */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                SIHANDAL
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-28 max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 mb-8 shadow-sm">
            Bawaslu Provinsi Jawa Barat
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Tata Kelola Hibah yang <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
              Transparan & Akuntabel
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed">
            Sistem Informasi Hibah, Administrasi dan Pengendalian (SIHANDAL) mengawal pengelolaan hibah non-pemilihan secara terstandar, terintegrasi, dan terpantau real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Link 
              href="/login" 
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              Akses Dashboard
            </Link>
            <a 
              href="#informasi" 
              className="px-8 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-all w-full sm:w-auto"
            >
              Pelajari Inovasi
            </a>
          </div>
        </section>

        {/* Informasi Inovasi Section */}
        <section id="informasi" className="bg-white py-24 border-t border-slate-100 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">6 Pilar Inovasi SIHANDAL</h2>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-lg">
                Mekanisme pengendalian terpadu untuk memastikan setiap tahapan pengelolaan hibah berjalan sesuai aturan.
              </p>
            </div>
            
            {/* Grid Card yang Sudah Dipercantik */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="group bg-white p-8 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl mb-6 transition-colors duration-300 ${feature.color}`}>
                    0{i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-300 mb-2">Bawaslu Provinsi Jawa Barat</p>
          <p className="text-sm">Bersama Rakyat Awasi Pemilu, Bersama Bawaslu Tegakkan Keadilan Pemilu.</p>
        </div>
      </footer>
    </div>
  );
}