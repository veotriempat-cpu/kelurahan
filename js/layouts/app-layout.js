import { sidebarTemplate } from './sidebar.js';
import { headerTemplate } from './header.js';
import { template as view_dashboard } from './views/dashboard.js';
import { template as view_kependudukan } from './views/kependudukan.js';
import { template as view_statistik_warga } from './views/statistik-warga.js';
import { template as view_statistik_pekerjaan } from './views/statistik-pekerjaan.js';
import { template as view_status_usaha } from './views/status-usaha.js';
import { template as view_arsip_surat } from './views/arsip-surat.js';
import { template as view_surat } from './views/surat.js';
import { template as view_tamu } from './views/tamu.js';
import { template as view_laporan } from './views/laporan.js';
import { template as view_arisan } from './views/arisan.js';
import { template as view_sumbangan } from './views/sumbangan.js';
import { template as view_kas } from './views/kas.js';
import { template as view_administrasi } from './views/administrasi.js';
import { template as view_umkm } from './views/umkm.js';
import { template as view_fasilitas } from './views/fasilitas.js';
import { template as view_bursa } from './views/bursa.js';
import { template as view_galeri } from './views/galeri.js';
import { template as view_agenda } from './views/agenda.js';
import { template as view_pengajuan_usaha } from './views/pengajuan-usaha.js';
import { template as view_verifikasi_usaha } from './views/verifikasi-usaha.js';
import { template as view_verifikasi_pengantar } from './views/verifikasi-pengantar.js';
import { template as view_pengaturan_pejabat } from './views/pengaturan-pejabat.js';

export const loggedTemplate = `
<div class="flex h-screen overflow-hidden bg-gray-50" v-if="isLoggedIn">
    ${sidebarTemplate}
    <main class="flex-1 flex flex-col h-full overflow-hidden">
        ${headerTemplate}
        <div class="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
            ${view_dashboard + "\n" + view_kependudukan + "\n" + view_statistik_warga + "\n" + view_statistik_pekerjaan + "\n" + view_status_usaha + "\n" + view_arsip_surat + "\n" + view_surat + "\n" + view_tamu + "\n" + view_laporan + "\n" + view_arisan + "\n" + view_sumbangan + "\n" + view_kas + "\n" + view_administrasi + "\n" + view_umkm + "\n" + view_fasilitas + "\n" + view_bursa + "\n" + view_galeri + "\n" + view_agenda + "\n" + view_pengajuan_usaha + "\n" + view_verifikasi_usaha + "\n" + view_verifikasi_pengantar + "\n" + view_pengaturan_pejabat}
        </div>
    </main>
</div>`;
