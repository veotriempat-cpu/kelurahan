import { createApp, ref, computed, onMounted } from 'vue';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, appId } from './firebase.js';
import { template } from './app-template.js';

        createApp({
            template,
            setup() {
                const fbUser = ref(null);
                const notification = ref({ show: false, message: '', type: 'success' });
                const showToast = (msg, type='success') => { notification.value={show:true, message:msg, type}; setTimeout(()=>notification.value.show=false, 4000); };
                
                // CUSTOM DIALOG LOGIC
                const dialog = ref({ show: false, type: 'confirm', title: '', message: '', inputValue: '', onConfirm: null });
                const customConfirm = (title, message, onConfirmCallback) => { dialog.value = { show: true, type: 'confirm', title, message, inputValue: '', onConfirm: onConfirmCallback }; };
                const customPrompt = (title, message, defaultVal, onConfirmCallback) => { dialog.value = { show: true, type: 'prompt', title, message, inputValue: defaultVal, onConfirm: onConfirmCallback }; };
                const executeDialog = () => { if(dialog.value.onConfirm) { dialog.value.onConfirm(dialog.value.inputValue); } dialog.value.show = false; };

                const isLoggedIn = ref(false);
                const currentAuthView = ref('landing');
                const isRegistering = ref(false);
                const isRegisteringLuar = ref(false); 
                const regStep = ref(1);
                const sidebarOpen = ref(false);
                const menu = ref('dashboard');
                const user = ref({ nama: '', role: '', rt: '', rw: '', username: '', ttd: '' });
                const publicTab = ref('agenda'); 
                const tabArisan = ref('anggota'); 
                
                const showPassLogin = ref(false);
                const showPassRegLuar = ref(false);
                const showPassReg = ref(false);
                const showPassRegRep = ref(false);
                const showPassAdmin = ref(false);
                const showPassPejabat = ref(false);

                const zoomedImage = ref(null); 
                const selectedWarga = ref(null); 

                const showFormUmkm = ref(false);
                const showFormGaleri = ref(false);
                const showFormBursa = ref(false);
                const showFormFasilitas = ref(false);
                const showFormAgenda = ref(false); 
                const showFormSuratWarga = ref(false);
                const showFormBansos = ref(false);
                const showFormAdministrasi = ref(false);
                const showFormTamu = ref(false);
                const showFormLaporan = ref(false);
                const showFormPengajuan = ref(false);
                const showFormSumbangan = ref(false);

                const webSettings = ref({
                    warnaUtama: '#1e3a8a', logo: '', namaWebsite: 'Portal Kelurahan Digital', headerText: 'Layanan Digital Terpadu', footerText: '© 2026 Sistem Informasi Kelurahan Digital. Semua Hak Dilindungi.',
                    walikota: { nama: 'Bapak Walikota', jabatan: 'Walikota', foto: 'https://via.placeholder.com/150', pesan: 'Wujudkan kota cerdas dengan pelayanan publik digital.' },
                    wakil: { nama: 'Bapak Wakil Walikota', jabatan: 'Wakil Walikota', foto: 'https://via.placeholder.com/150', pesan: 'Kolaborasi bersama membangun daerah.' },
                    camat: { nama: 'Bapak Camat', jabatan: 'Camat', foto: 'https://via.placeholder.com/150', pesan: 'Bersinergi membangun wilayah kecamatan.' },
                    lurah: { nama: 'Bapak Lurah', jabatan: 'Kepala Kelurahan', foto: 'https://via.placeholder.com/200', pesan: 'Selamat datang di portal resmi kelurahan digital.' },
                    ttd: { lurah: '', sekretaris: '', stempel: '', aktif: true }
                });

                const formWargaTtd = ref({ url: '' });
                const formAdmin = ref({ username: 'admin123', password: 'admin123' });
                const adminAccount = ref({ username: 'admin123', password: 'admin123' }); 
                
                const formPejabat = ref({ nama: '', role: 'rt', wilayah: '', rt: '', rw: '', username: '', password: '', ttd: '', stempel: '' });
                const listPejabat = ref([]);
                const listBendahara = ref([]);
                const formBendahara = ref({ nama: '', username: '', password: '' });
                
                const formTamu = ref({ nama:'', nik:'', asal:'', lama:'', tujuan:'', foto:null });
                const listTamu = ref([]);

                const formLaporan = ref({ judul:'', isi:'', kategori:'Infrastruktur', privasi:'Publik', foto:null });
                const listLaporan = ref([]);

                const formSumbangan = ref({ nama:'', nominal:'', jenis:'' });
                const formSumbanganWarga = ref({ jenis:'', nominal:'', bukti:null });
                const listSumbangan = ref([]);
                
                const formArisan = ref({ nama:'', iuran:'' });
                const listArisan = ref([]); 
                const riwayatArisan = ref([]);
                const logAktivitas = ref([]); 

                const loginForm = ref({ email: '', password: '' });
                const reg = ref({ nik:'', nokk:'', nama:'', rt:'', rw:'', alamat:'', tempat_lahir:'', tgl_lahir:'', kelamin:'Laki-laki', pendidikan:'SMA/SMK', pekerjaan:'', usaha:'', username:'', password:'', repeatPassword:'', status_keluarga:'Kepala Keluarga', status_nikah:'Belum Menikah', jml_kk:1, status_rumah:'Milik Sendiri', sehat_status:'Sehat', gol_darah:'-', penghasilan:'< 1 juta', hp1:'', hp2:'', suku:'', ttd:'' }); 
                const regLuar = ref({ nama: '', nik: '', alamat: '', hp: '', username: '', password: '', ttd:'' });
                
                const listWarga = ref([]);
                const listWargaLuar = ref([]);
                
                const formUsahaLuar = ref({ fotoKtp: null, jenisUsaha: '', namaUsaha: '', lokasiUsaha: '', rt: '', rw: '', keperluan: '', alasan: '', fotoUsaha: null });
                const listPengajuanUsaha = ref([]); 
                
                const formSuratPengantar = ref({ tujuan: 'RT/RW', nama: '', nik: '', hp: '', alamat: '', rt: '', rw: '', keperluan: '', fotoKtp: null, fotoKk: null, fotoDok: null, catatan: '' });
                const listSuratPengantar = ref([]); 

                const formUmkm = ref({ nama:'', wa:'', jamBuka:'08:00', jamTutup:'21:00', nib:'', alamat:'', harga:'', deskripsi:'', foto1:null, foto2:null });
                const formGaleri = ref({ judul:'', foto:null });
                const formBursa = ref({ judul:'', deskripsi:'', wa:'' });
                const formFasilitas = ref({ judul:'', lokasi:'', deskripsi:'', foto:null });
                const formBansos = ref({ nama:'', jenis:'', rt:'', rw:'', foto:null }); 
                const formAnggaran = ref({ bidang:'Infrastruktur', bidangLainnya:'', pagu:'', realisasi:'' });
                const formSampah = ref({ nama:'', jenis:'', berat:'' }); 
                const formAgenda = ref({ judul:'', isi:'', kategori:'Pengumuman', tanggal:'', foto:null }); 

                const listAgenda = ref([]);
                const listUmkm = ref([]);
                const listGaleri = ref([]);
                const listBursa = ref([]);
                const listFasilitas = ref([]);
                const listBansos = ref([]);
                const listAnggaran = ref([]);
                const listSampah = ref([]);

                // INIT FIREBASE
                onMounted(() => {
                    const initAuth = async () => {
                        try {
                            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                                await signInWithCustomToken(auth, __initial_auth_token);
                            } else {
                                await signInAnonymously(auth);
                            }
                        } catch (e) { 
                            console.error("Auth error", e); 
                            showToast("Berjalan dalam Mode Lokal (Data akan hilang saat direfresh karena tidak ada database cloud sungguhan yang tersambung).", "warning");
                        }
                    };
                    initAuth();
                    
                    onAuthStateChanged(auth, (u) => {
                        fbUser.value = u;
                        if(u) { setupListeners(); }
                    });
                });

                const getColRef = (cName) => collection(db, 'artifacts', appId, 'public', 'data', cName);
                const getDocRef = (cName, dId) => doc(db, 'artifacts', appId, 'public', 'data', cName, dId);

                const getListMap = () => ({
                    'pejabat': listPejabat, 'warga': listWarga, 'wargaLuar': listWargaLuar, 'bendahara': listBendahara, 
                    'tamu': listTamu, 'laporan': listLaporan, 'sumbangan': listSumbangan, 'arisan': listArisan, 
                    'riwayatArisan': riwayatArisan, 'logAktivitas': logAktivitas, 'pengajuanUsaha': listPengajuanUsaha,
                    'suratPengantar': listSuratPengantar, 'umkm': listUmkm, 'galeri': listGaleri, 'bursa': listBursa, 
                    'fasilitas': listFasilitas, 'bansos': listBansos, 'anggaran': listAnggaran, 'sampah': listSampah, 'agenda': listAgenda
                });

                const setupListeners = () => {
                    if(!fbUser.value) return;
                    const sync = (cName, refVar) => {
                        onSnapshot(getColRef(cName), (snap) => {
                            refVar.value = snap.docs.map(d => ({ ...d.data(), id: d.id }));
                        }, (err) => console.error("Firebase Sync Error on " + cName, err));
                    };

                    sync('warga', listWarga);
                    sync('wargaLuar', listWargaLuar);
                    sync('pejabat', listPejabat);
                    sync('bendahara', listBendahara);
                    sync('tamu', listTamu);
                    sync('sumbangan', listSumbangan);
                    sync('arisan', listArisan);
                    sync('riwayatArisan', riwayatArisan);
                    sync('logAktivitas', logAktivitas);
                    sync('pengajuanUsaha', listPengajuanUsaha);
                    sync('suratPengantar', listSuratPengantar);
                    sync('umkm', listUmkm);
                    sync('galeri', listGaleri);
                    sync('bursa', listBursa);
                    sync('fasilitas', listFasilitas);
                    sync('bansos', listBansos);
                    sync('anggaran', listAnggaran);
                    sync('sampah', listSampah);
                    sync('agenda', listAgenda);
                    sync('laporan', listLaporan);

                    onSnapshot(getDocRef('settings', 'webSettings'), (d) => {
                        if(d.exists()) {
                            const data = d.data();
                            if(!data.camat) data.camat = { nama: 'Bapak Camat', jabatan: 'Camat', foto: 'https://via.placeholder.com/150', pesan: 'Bersinergi membangun wilayah kecamatan yang maju.' };
                            webSettings.value = data;
                        }
                    }, (err) => console.error(err));

                    onSnapshot(getDocRef('settings', 'adminAccount'), (d) => {
                        if(d.exists()) adminAccount.value = d.data();
                    }, (err) => console.error(err));
                };

                const saveData = async (colName, data) => {
                    const id = data.id || Date.now().toString();
                    const payload = { ...data, id: id.toString() };
                    
                    if(fbUser.value) {
                        try {
                            await setDoc(getDocRef(colName, id.toString()), payload);
                            return; 
                        } catch (e) {
                            console.error("Firebase Save Error:", e);
                            showToast("Error Firebase: Gagal menyimpan data.", "danger");
                        }
                    }
                    
                    // FALLBACK
                    const map = getListMap();
                    if(map[colName]) {
                        const list = map[colName].value;
                        const idx = list.findIndex(x => x.id === payload.id);
                        if(idx >= 0) list[idx] = payload;
                        else list.push(payload);
                    }
                };

                const updateData = async (colName, data) => {
                    if(fbUser.value) {
                        try {
                            await setDoc(getDocRef(colName, data.id.toString()), data, { merge: true });
                            return;
                        } catch (e) { console.error(e); }
                    }
                    const map = getListMap();
                    if(map[colName]) {
                        const list = map[colName].value;
                        const idx = list.findIndex(x => x.id === data.id);
                        if(idx >= 0) list[idx] = { ...list[idx], ...data };
                    }
                };

                const deleteData = async (colName, id) => {
                    if(fbUser.value) {
                        try {
                            await deleteDoc(getDocRef(colName, id.toString()));
                            return;
                        } catch (e) { console.error(e); }
                    }
                    const map = getListMap();
                    if(map[colName]) {
                        map[colName].value = map[colName].value.filter(x => x.id !== id);
                    }
                };

                const catatLog = async (aksiStr) => {
                    const now = new Date().toLocaleString('id-ID');
                    await saveData('logAktivitas', { rt: user.value.rt, rw: user.value.rw, waktu: now, user: user.value.nama, aksi: aksiStr });
                };

                const uploadFile = (e, target) => {
                    const f = e.target.files[0]; if(!f) return;
                    const r = new FileReader(); r.readAsDataURL(f);
                    r.onload = (evt) => { 
                        if(target==='umkm1') formUmkm.value.foto1 = evt.target.result; 
                        if(target==='umkm2') formUmkm.value.foto2 = evt.target.result; 
                        if(target==='galeri') formGaleri.value.foto = evt.target.result;
                        if(target==='bansos') formBansos.value.foto = evt.target.result;
                        if(target==='agenda') formAgenda.value.foto = evt.target.result;
                        if(target==='fasilitas') formFasilitas.value.foto = evt.target.result;
                        if(target==='tamu') formTamu.value.foto = evt.target.result; 
                        if(target==='laporan') formLaporan.value.foto = evt.target.result;
                        if(target==='ktpLuar') formUsahaLuar.value.fotoKtp = evt.target.result; 
                        if(target==='fotoUsaha') formUsahaLuar.value.fotoUsaha = evt.target.result; 
                        if(target==='pengantarKtp') formSuratPengantar.value.fotoKtp = evt.target.result; 
                        if(target==='pengantarKk') formSuratPengantar.value.fotoKk = evt.target.result; 
                        if(target==='pengantarDok') formSuratPengantar.value.fotoDok = evt.target.result; 
                        if(target==='buktiSumbangan') formSumbanganWarga.value.bukti = evt.target.result; 
                        if(target==='pejabatTtd') { const p = listPejabat.value.find(x => x.username === user.value.username); if(p) p.ttd = evt.target.result; }
                        if(target==='pejabatStempel') { const p = listPejabat.value.find(x => x.username === user.value.username); if(p) p.stempel = evt.target.result; }
                    };
                };

                const handleLogin = () => {
                    const emailInput = String(loginForm.value.email).trim();
                    const passInput = String(loginForm.value.password).trim();
                    if (!emailInput || !passInput) return showToast('Harap ketik Username dan Password Anda!', 'danger');
                    
                    if (emailInput === String(adminAccount.value.username) && passInput === String(adminAccount.value.password)) {
                        user.value = { nama:'Administrator', role:'admin_kelurahan', rt:'', rw:'', username: adminAccount.value.username, ttd:'' }; 
                        isLoggedIn.value = true; return showToast('Login Admin Utama Sukses');
                    }
                    const p = listPejabat.value.find(x => String(x.username) === emailInput && String(x.password) === passInput);
                    if (p) {
                        user.value = { nama: p.nama, role: p.role, rt: p.rt, rw: p.rw, username: p.username, ttd: p.ttd }; 
                        isLoggedIn.value = true; 
                        if (p.role === 'babinsa') menu.value = 'tamu'; 
                        return showToast(`Berhasil masuk sebagai ${p.role.toUpperCase()}`);
                    }
                    const b = listBendahara.value.find(x => String(x.username) === emailInput && String(x.password) === passInput);
                    if (b) {
                        user.value = { nama: b.nama, role: 'bendahara', rt: b.rt, rw: b.rw, username: b.username, ttd:'' }; 
                        isLoggedIn.value = true; return showToast(`Berhasil masuk sebagai BENDAHARA RT ${b.rt} / RW ${b.rw}`);
                    }
                    const w = listWarga.value.find(x => (String(x.username) === emailInput || String(x.nik) === emailInput) && String(x.password) === passInput);
                    if (w) { 
                        user.value = { nama: w.nama, role: 'warga', rt: w.rt, rw: w.rw, username: w.username, ttd: w.ttd }; 
                        formWargaTtd.value.url = w.ttd || ''; isLoggedIn.value = true; return showToast('Login Warga Sukses'); 
                    }
                    const wLuar = listWargaLuar.value.find(x => String(x.username) === emailInput && String(x.password) === passInput);
                    if (wLuar) {
                        user.value = { nama: wLuar.nama, role: 'warga_luar', rt: '', rw: '', username: wLuar.username, ttd: wLuar.ttd }; 
                        formWargaTtd.value.url = wLuar.ttd || ''; isLoggedIn.value = true; menu.value = 'pengajuan-usaha'; return showToast('Login Warga Luar Sukses');
                    }
                    showToast('Username/NIK atau Password SALAH! Akses ditolak.', 'danger');
                };

                const handleRegister = async () => {
                    if(reg.value.password !== reg.value.repeatPassword) return showToast('Password tidak sama!', 'danger');
                    await saveData('warga', { ...reg.value });
                    isRegistering.value = false; showToast('Pendaftaran Berhasil! Silakan Login.');
                };

                const handleRegisterLuar = async () => {
                    if(!regLuar.value.username || !regLuar.value.password || !regLuar.value.nama) return showToast('Mohon lengkapi data!', 'danger');
                    await saveData('wargaLuar', { ...regLuar.value });
                    isRegisteringLuar.value = false; showToast('Pendaftaran Warga Luar Berhasil! Silakan Login.');
                    regLuar.value = { nama: '', nik: '', alamat: '', hp: '', username: '', password: '', ttd:'' };
                };

                const logout = () => { isLoggedIn.value=false; currentAuthView.value='landing'; menu.value='dashboard'; showToast('Berhasil Logout'); };

                const getPejabatSetting = () => { return listPejabat.value.find(x => x.username === user.value.username) || { ttd:'', stempel:'' }; };
                
                const simpanPengaturanPejabat = async () => {
                    const p = getPejabatSetting();
                    if(p && p.id) { await updateData('pejabat', p); showToast('Pengaturan Digital Pejabat Tersimpan!'); }
                };

                const simpanWebSettings = async () => { 
                    if(fbUser.value) {
                        await setDoc(getDocRef('settings', 'webSettings'), webSettings.value);
                        showToast('Pengaturan Website & TTD Berhasil Disimpan!');
                    } else {
                        showToast('Mode Offline: Pengaturan hanya tersimpan sementara.', 'warning');
                    } 
                };

                const updateAdmin = async () => { 
                    if(!formAdmin.value.username || !formAdmin.value.password) return showToast('Tidak Boleh Kosong', 'danger'); 
                    adminAccount.value = { ...formAdmin.value }; 
                    if(fbUser.value) {
                        await setDoc(getDocRef('settings', 'adminAccount'), adminAccount.value);
                        showToast('Akses Admin Utama Berhasil Diubah!'); 
                    } else {
                        showToast('Akses Admin Diubah (Mode Lokal Sementara).', 'warning');
                    }
                };

                const simpanTtdWarga = async () => {
                    if(user.value.role === 'warga'){
                        const w = listWarga.value.find(x => x.username === user.value.username);
                        if(w) { w.ttd = formWargaTtd.value.url; await updateData('warga', w); }
                    } else if(user.value.role === 'warga_luar'){
                        const wLuar = listWargaLuar.value.find(x => x.username === user.value.username);
                        if(wLuar) { wLuar.ttd = formWargaTtd.value.url; await updateData('wargaLuar', wLuar); }
                    }
                    user.value.ttd = formWargaTtd.value.url;
                    showToast('Pengaturan TTD Anda Berhasil Disimpan!');
                };
                
                const simpanSuratPengantar = async () => {
                    if(!formSuratPengantar.value.rt || !formSuratPengantar.value.rw || !formSuratPengantar.value.fotoKtp) return showToast('Harap lengkapi RT, RW dan KTP!', 'danger');
                    const tglNow = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    
                    let sRT = formSuratPengantar.value.tujuan === 'Lurah' ? 'Bypass' : 'Menunggu';
                    let sRW = formSuratPengantar.value.tujuan === 'Lurah' ? 'Bypass' : 'Menunggu';
                    let sAdmin = 'Menunggu';

                    await saveData('suratPengantar', { ...formSuratPengantar.value, username: user.value.username, tanggal: tglNow, statusRT: sRT, statusRW: sRW, statusAdmin: sAdmin });
                    showToast('Pengajuan Surat Terkirim!');
                    formSuratPengantar.value = { tujuan: 'RT/RW', nama: '', nik: '', hp: '', alamat: '', rt: '', rw: '', keperluan: '', fotoKtp: null, fotoKk: null, fotoDok: null, catatan: '' };
                    showFormSuratWarga.value = false;
                };

                const setujuiPengantar = async (u, role, isApprove) => {
                    const statusText = isApprove ? 'Disetujui' : 'Ditolak';
                    if (role === 'rt') u.statusRT = statusText;
                    if (role === 'rw') u.statusRW = statusText;
                    if (role === 'admin') u.statusAdmin = statusText;
                    await updateData('suratPengantar', u);
                    showToast(`Surat Warga ${statusText}!`);
                };
                
                const cetakPengantarWarga = (p) => {
                    const printWindow = window.open('', '_blank');
                    
                    if(p.tujuan === 'Lurah') {
                        const lurahName = webSettings.value.lurah.nama || '......................';
                        const ttdLurah = webSettings.value.ttd.lurah ? `<img src="${webSettings.value.ttd.lurah}" style="max-height:60px; position:absolute; z-index:-1; margin-top:-10px;">` : '';
                        const stempelLurah = webSettings.value.ttd.stempel ? `<img src="${webSettings.value.ttd.stempel}" style="max-height:80px; position:absolute; opacity:0.6; margin-left:-30px; margin-top:-20px; transform: rotate(-10deg);">` : '';
                        
                        printWindow.document.write(`
                            <html><head><title>Surat Keterangan Lurah</title><style>body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; line-height: 1.5; } .header { text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; } .header h3 { margin: 3px 0; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } td { padding: 5px; vertical-align: top; } .col-label { width: 200px; }</style></head><body>
                            <div class="header"><h3>PEMERINTAH KOTA / KABUPATEN</h3><h3>KELURAHAN DIGITAL, KECAMATAN PUSAT</h3></div>
                            <h3 style="text-align:center; text-decoration: underline; margin-bottom:0;">SURAT KETERANGAN LURAH</h3>
                            <p style="text-align:center; margin-top:5px;">Nomor: ${Date.now().toString().slice(-6)} / KEL / ${new Date().getFullYear()}</p>
                            <br><p>Yang bertanda tangan di bawah ini Kepala Kelurahan, menerangkan dengan sesungguhnya bahwa:</p>
                            <table><tr><td class="col-label">Nama Lengkap</td><td>: <strong>${p.nama}</strong></td></tr><tr><td class="col-label">NIK</td><td>: ${p.nik}</td></tr><tr><td class="col-label">Alamat</td><td>: ${p.alamat} (RT ${p.rt}/RW ${p.rw})</td></tr><tr><td class="col-label">Keperluan</td><td>: <strong>${p.keperluan}</strong></td></tr></table>
                            <br><p>Orang tersebut di atas benar warga kami dan surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
                            <br><br><div style="text-align: right; width: 100%;"><div style="display:inline-block; text-align:left; position:relative; width: 250px;"><p>Kepala Kelurahan,</p><br><br>${stempelLurah}${ttdLurah}<br><br><p>( <strong>${lurahName}</strong> )</p></div></div>
                            <script>window.print();<\/script></body></html>
                        `);
                    } else {
                        const rtObj = listPejabat.value.find(x => x.role === 'rt' && x.rt == p.rt && x.rw == p.rw);
                        const rwObj = listPejabat.value.find(x => x.role === 'rw' && x.rw == p.rw);
                        const ttdRt = rtObj?.ttd ? `<img src="${rtObj.ttd}" style="max-height:60px; position:absolute; z-index:-1; margin-top:-10px;">` : '';
                        const ttdRw = rwObj?.ttd ? `<img src="${rwObj.ttd}" style="max-height:60px; position:absolute; z-index:-1; margin-top:-10px;">` : '';
                        const stempelRt = rtObj?.stempel ? `<img src="${rtObj.stempel}" style="max-height:80px; position:absolute; opacity:0.6; margin-left:-30px; margin-top:-20px; transform: rotate(-10deg);">` : '';
                        const stempelRw = rwObj?.stempel ? `<img src="${rwObj.stempel}" style="max-height:80px; position:absolute; opacity:0.6; margin-left:-30px; margin-top:-20px; transform: rotate(-10deg);">` : '';

                        printWindow.document.write(`
                            <html><head><title>Surat Pengantar RT/RW</title><style>body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; line-height: 1.5; } .header { text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; } .header h3 { margin: 3px 0; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } td { padding: 5px; vertical-align: top; } .col-label { width: 200px; }</style></head><body>
                            <div class="header"><h3>PENGURUS RT ${p.rt} / RW ${p.rw}</h3><h3>KELURAHAN DIGITAL, KECAMATAN PUSAT</h3></div>
                            <h3 style="text-align:center; text-decoration: underline; margin-bottom:0;">SURAT PENGANTAR RT/RW</h3>
                            <p style="text-align:center; margin-top:5px;">Nomor: ${Date.now().toString().slice(-6)} / RT${p.rt} / ${new Date().getFullYear()}</p>
                            <br><p>Yang bertanda tangan di bawah ini Ketua RT ${p.rt} dan Ketua RW ${p.rw}, menerangkan dengan sesungguhnya bahwa:</p>
                            <table><tr><td class="col-label">Nama Lengkap</td><td>: <strong>${p.nama}</strong></td></tr><tr><td class="col-label">NIK</td><td>: ${p.nik}</td></tr><tr><td class="col-label">Alamat</td><td>: ${p.alamat}</td></tr><tr><td class="col-label">Keperluan</td><td>: <strong>${p.keperluan}</strong></td></tr></table>
                            <br><p>Orang tersebut di atas benar warga kami dan surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
                            <br><br><div style="display: flex; justify-content: space-between; text-align: center;"><div style="width: 40%; position:relative;"><p>Mengetahui,<br>Ketua RT ${p.rt}</p><br><br>${stempelRt}${ttdRt}<br><br><p>( ${rtObj?.nama || '......................'} )</p></div><div style="width: 40%; position:relative;"><p>Ketua RW ${p.rw}</p><br><br>${stempelRw}${ttdRw}<br><br><p>( ${rwObj?.nama || '......................'} )</p></div></div>
                            <script>window.print();<\/script></body></html>
                        `);
                    }
                    printWindow.document.close();
                };

                const simpanTamu = async () => {
                    if(!formTamu.value.nama || !formTamu.value.nik) return showToast('Lengkapi data tamu dengan benar', 'danger');
                    await saveData('tamu', { ...formTamu.value, pelapor: user.value.nama, rt: user.value.rt, rw: user.value.rw, tanggal: new Date().toLocaleDateString('id-ID') });
                    showToast('Laporan Tamu Berhasil Disimpan');
                    formTamu.value = { nama:'', nik:'', asal:'', lama:'', tujuan:'', foto:null };
                    showFormTamu.value = false;
                };

                const simpanBendahara = async () => {
                    if(!formBendahara.value.username || !formBendahara.value.password) return showToast('Lengkapi data bendahara', 'danger');
                    await saveData('bendahara', { ...formBendahara.value, rt: user.value.rt, rw: user.value.rw });
                    showToast('Bendahara berhasil ditambahkan');
                    formBendahara.value = { nama: '', username: '', password: '' };
                };

                const kirimSumbanganWarga = async () => {
                    if(!formSumbanganWarga.value.nominal || !formSumbanganWarga.value.bukti) return showToast('Nominal dan Bukti Transfer wajib diisi!', 'danger');
                    await saveData('sumbangan', { ...formSumbanganWarga.value, nama: user.value.nama, username: user.value.username, rt: user.value.rt, rw: user.value.rw, tanggal: new Date().toLocaleDateString('id-ID'), status: 'Menunggu Validasi' });
                    showToast('Sumbangan terkirim! Menunggu divalidasi RT/RW.');
                    formSumbanganWarga.value = { jenis:'', nominal:'', bukti:null };
                };

                const simpanSumbangan = async () => {
                    if(!formSumbangan.value.nama || !formSumbangan.value.nominal) return showToast('Harap melengkapi data', 'danger');
                    await saveData('sumbangan', { ...formSumbangan.value, rt: user.value.rt, rw: user.value.rw, tanggal: new Date().toLocaleDateString('id-ID'), status: 'Divalidasi' });
                    showToast('Data sumbangan dicatat ke Kas');
                    formSumbangan.value = { nama:'', nominal:'', jenis:'' };
                };
                
                const validasiSumbangan = async (s) => {
                    s.status = 'Divalidasi';
                    await updateData('sumbangan', s);
                    showToast('Sumbangan divalidasi dan masuk ke Kas!');
                };

                const simpanBansos = async () => {
                    if(!formBansos.value.nama || !formBansos.value.jenis) return showToast('Lengkapi data bansos', 'danger');
                    await saveData('bansos', { ...formBansos.value, rt: user.value.rt, rw: user.value.rw });
                    showToast('Data Bansos Berhasil Disimpan');
                    formBansos.value = { nama:'', jenis:'', rt:'', rw:'', foto:null };
                    showFormBansos.value = false;
                };

                const simpanAnggaran = async () => {
                    if(!formAnggaran.value.pagu || !formAnggaran.value.realisasi) return showToast('Isi pagu dan realisasi', 'danger');
                    await saveData('anggaran', { ...formAnggaran.value, pembuat: user.value.nama, rt: user.value.rt, rw: user.value.rw });
                    showToast('Anggaran Berhasil Disimpan');
                    formAnggaran.value = { bidang:'Infrastruktur', bidangLainnya:'', pagu:'', realisasi:'' };
                    showFormAdministrasi.value = false;
                };

                const simpanUmkm = async () => {
                    if(!formUmkm.value.nama || !formUmkm.value.foto1) return showToast('Nama dan Foto 1 wajib diisi', 'danger');
                    await saveData('umkm', { ...formUmkm.value, pemilik: user.value.nama, username: user.value.username });
                    showToast('Lapak UMKM Berhasil Dipublish');
                    formUmkm.value = { nama:'', wa:'', jamBuka:'08:00', jamTutup:'21:00', nib:'', alamat:'', harga:'', deskripsi:'', foto1:null, foto2:null };
                    showFormUmkm.value = false;
                };

                const simpanGaleri = async () => {
                    if(!formGaleri.value.foto) return showToast('Pilih foto terlebih dahulu', 'danger');
                    await saveData('galeri', { ...formGaleri.value, uploader: user.value.nama });
                    showToast('Foto Berhasil Diunggah ke Galeri');
                    formGaleri.value = { judul:'', foto:null };
                    showFormGaleri.value = false;
                };

                const simpanBursa = async () => {
                    if(!formBursa.value.judul || !formBursa.value.deskripsi) return showToast('Lengkapi data iklan', 'danger');
                    await saveData('bursa', { ...formBursa.value, pengiklan: user.value.nama, username: user.value.username });
                    showToast('Iklan/Jasa Berhasil Diposting');
                    formBursa.value = { judul:'', deskripsi:'', wa:'' };
                    showFormBursa.value = false;
                };

                const simpanFasilitas = async () => {
                    if(!formFasilitas.value.judul || !formFasilitas.value.foto) return showToast('Judul dan foto wajib diisi', 'danger');
                    await saveData('fasilitas', { ...formFasilitas.value, pelapor: user.value.nama, username: user.value.username, status: 'Menunggu Penanganan' });
                    showToast('Laporan Fasilitas Terkirim');
                    formFasilitas.value = { judul:'', lokasi:'', deskripsi:'', foto:null };
                    showFormFasilitas.value = false;
                };

                const simpanAgenda = async () => {
                    if(!formAgenda.value.judul || !formAgenda.value.tanggal) return showToast('Judul dan Tanggal wajib diisi', 'danger');
                    await saveData('agenda', { ...formAgenda.value, pembuat: user.value.nama });
                    showToast('Agenda/Berita Berhasil Diterbitkan');
                    formAgenda.value = { judul:'', isi:'', kategori:'Pengumuman', tanggal:'', foto:null };
                    showFormAgenda.value = false;
                };

                const simpanPengajuanUsaha = async () => {
                    if(!formUsahaLuar.value.namaUsaha || !formUsahaLuar.value.fotoKtp || !formUsahaLuar.value.fotoUsaha) return showToast('Lengkapi data dan wajib upload KTP & Foto Usaha', 'danger');
                    const tglNow = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    const noPengajuan = 'SKU-' + Date.now().toString().slice(-6);
                    await saveData('pengajuanUsaha', { 
                        ...formUsahaLuar.value, 
                        nama: user.value.nama, 
                        username: user.value.username, 
                        tanggal: tglNow,
                        nomorPengajuan: noPengajuan,
                        statusRT: 'Menunggu', 
                        statusRW: 'Menunggu', 
                        statusAdmin: 'Menunggu' 
                    });
                    showToast('Pengajuan Berhasil Dikirim');
                    formUsahaLuar.value = { fotoKtp: null, jenisUsaha: '', namaUsaha: '', lokasiUsaha: '', rt: '', rw: '', keperluan: '', alasan: '', fotoUsaha: null };
                    showFormPengajuan.value = false;
                };

                const setujuiUsaha = async (u, role, isApprove) => {
                    const statusText = isApprove ? 'Disetujui' : 'Ditolak';
                    if (role === 'rt') u.statusRT = statusText;
                    if (role === 'rw') u.statusRW = statusText;
                    if (role === 'admin') u.statusAdmin = statusText;
                    await updateData('pengajuanUsaha', u);
                    showToast(`Pengajuan Usaha ${statusText}!`);
                };

                const cetakSuratUsaha = (u) => {
                    const printWindow = window.open('', '_blank');
                    const lurahName = webSettings.value.lurah.nama || '......................';
                    const ttdLurah = webSettings.value.ttd.lurah ? `<img src="${webSettings.value.ttd.lurah}" style="max-height:60px; position:absolute; z-index:-1; margin-top:-10px;">` : '';
                    const stempelLurah = webSettings.value.ttd.stempel ? `<img src="${webSettings.value.ttd.stempel}" style="max-height:80px; position:absolute; opacity:0.6; margin-left:-30px; margin-top:-20px; transform: rotate(-10deg);">` : '';
                    
                    printWindow.document.write(`
                        <html><head><title>Surat Keterangan Usaha</title><style>body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; line-height: 1.5; } .header { text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 20px; } .header h3 { margin: 3px 0; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } td { padding: 5px; vertical-align: top; } .col-label { width: 200px; }</style></head><body>
                        <div class="header"><h3>PEMERINTAH KOTA / KABUPATEN</h3><h3>KELURAHAN DIGITAL, KECAMATAN PUSAT</h3></div>
                        <h3 style="text-align:center; text-decoration: underline; margin-bottom:0;">SURAT KETERANGAN USAHA</h3>
                        <p style="text-align:center; margin-top:5px;">Nomor: ${u.nomorPengajuan} / SKU / ${new Date().getFullYear()}</p>
                        <br><p>Yang bertanda tangan di bawah ini Kepala Kelurahan, menerangkan dengan sesungguhnya bahwa:</p>
                        <table><tr><td class="col-label">Nama Pemilik</td><td>: <strong>${u.nama}</strong></td></tr><tr><td class="col-label">Nama Usaha</td><td>: <strong>${u.namaUsaha}</strong> (${u.jenisUsaha})</td></tr><tr><td class="col-label">Lokasi Usaha</td><td>: ${u.lokasiUsaha} (RT ${u.rt}/RW ${u.rw})</td></tr></table>
                        <br><p>Adalah benar nama tersebut di atas memiliki usaha di wilayah kami. Surat keterangan ini dibuat untuk keperluan: <strong>${u.keperluan}</strong>.</p>
                        <br><br><div style="text-align: right; width: 100%;"><div style="display:inline-block; text-align:left; position:relative; width: 250px;"><p>Kepala Kelurahan,</p><br><br>${stempelLurah}${ttdLurah}<br><br><p>( <strong>${lurahName}</strong> )</p></div></div>
                        <script>window.print();<\/script></body></html>
                    `);
                    printWindow.document.close();
                };

                const simpanPejabat = async () => {
                    if(!formPejabat.value.nama || !formPejabat.value.username || !formPejabat.value.password) return showToast('Lengkapi data pejabat', 'danger');
                    await saveData('pejabat', { ...formPejabat.value });
                    showToast('Akun Pejabat Berhasil Didaftarkan');
                    formPejabat.value = { nama: '', role: 'rt', wilayah: '', rt: '', rw: '', username: '', password: '', ttd: '', stempel: '' };
                };

                const hapus = async (colName, id) => {
                    customConfirm('Hapus Data', 'Yakin ingin menghapus data ini?', async () => {
                        await deleteData(colName, id);
                        showToast('Data berhasil dihapus');
                    });
                };

                const simpanLaporan = async () => {
                    if(!formLaporan.value.judul || !formLaporan.value.isi) return showToast('Judul dan isi laporan wajib diisi', 'danger');
                    const tglNow = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                    await saveData('laporan', { 
                        ...formLaporan.value, 
                        pelapor: user.value.nama, 
                        username: user.value.username, 
                        rt: user.value.rt, 
                        rw: user.value.rw,
                        tanggal: tglNow,
                        status: 'Menunggu',
                        komentar: []
                    });
                    showToast('Pengaduan Berhasil Dikirim');
                    formLaporan.value = { judul:'', isi:'', kategori:'Infrastruktur', privasi:'Publik', foto:null };
                    showFormLaporan.value = false;
                };

                const balasKomentar = async (l) => {
                    if(!l.inputBalasan) return;
                    if(!l.komentar) l.komentar = [];
                    l.komentar.push({ nama: user.value.nama, isi: l.inputBalasan });
                    l.status = 'Diproses'; 
                    await updateData('laporan', l);
                    l.inputBalasan = '';
                    showToast('Tanggapan berhasil dikirim');
                };

                const daftarArisanWarga = async () => {
                    await saveData('arisan', {
                        nama: user.value.nama,
                        username: user.value.username,
                        rt: user.value.rt,
                        rw: user.value.rw,
                        noAnggota: 'A-' + Math.floor(Math.random() * 9000 + 1000),
                        totalIuran: 0,
                        statusMenang: false
                    });
                    showToast('Berhasil mendaftar Arisan Warga!');
                };

                const simpanArisan = async () => {
                    if(!formArisan.value.nama) return showToast('Nama anggota wajib diisi', 'danger');
                    await saveData('arisan', {
                        nama: formArisan.value.nama,
                        username: formArisan.value.nama.toLowerCase().replace(/\s/g, ''),
                        rt: user.value.rt,
                        rw: user.value.rw,
                        noAnggota: 'A-' + Math.floor(Math.random() * 9000 + 1000),
                        totalIuran: Number(formArisan.value.iuran || 0),
                        statusMenang: false
                    });
                    showToast('Anggota Arisan Ditambahkan');
                    formArisan.value = { nama:'', iuran:'' };
                };

                const tambahIuranManual = async (a, val) => {
                    const nominal = Number(val);
                    if(isNaN(nominal) || nominal <= 0) return showToast('Nominal tidak valid', 'danger');
                    a.totalIuran = (Number(a.totalIuran) || 0) + nominal;
                    await updateData('arisan', a);
                    showToast(`Iuran Rp ${nominal.toLocaleString('id-ID')} ditambahkan untuk ${a.nama}`);
                };

                const kocokArisan = async () => {
                    const anggotaBisaMenang = listArisan.value.filter(x => x.rt == user.value.rt && x.rw == user.value.rw && !x.statusMenang);
                    if(anggotaBisaMenang.length === 0) return showToast('Semua anggota sudah menang / belum ada anggota!', 'warning');
                    
                    const pemenang = anggotaBisaMenang[Math.floor(Math.random() * anggotaBisaMenang.length)];
                    const totalTarikan = hitungKasArisan(user.value.rt, user.value.rw);
                    
                    customConfirm('Pemenang Arisan!', `Selamat kepada: ${pemenang.nama}\nTotal Tarikan: Rp ${totalTarikan.toLocaleString('id-ID')}\n\nLanjutkan sahkan pemenang?`, async () => {
                        pemenang.statusMenang = true;
                        await updateData('arisan', pemenang);
                        
                        await saveData('riwayatArisan', {
                            rt: user.value.rt,
                            rw: user.value.rw,
                            nama: pemenang.nama,
                            nominal: totalTarikan,
                            tanggal: new Date().toLocaleDateString('id-ID')
                        });
                        
                        showToast(`Arisan dimenangkan oleh ${pemenang.nama}!`);
                    });
                };

                const cetakKartuArisan = (a) => {
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                        <html><head><title>Kartu Arisan</title><style>body { font-family: sans-serif; padding: 20px; text-align: center;} .card { border: 2px dashed #db2777; padding: 20px; border-radius: 10px; display: inline-block; width: 300px; background: #fdf2f8;} h2 { color: #9d174d; margin-top: 0; } p { margin: 5px 0; font-weight: bold; color: #333; }</style></head><body>
                        <div class="card">
                            <h2>KARTU ARISAN RT ${a.rt} / RW ${a.rw}</h2>
                            <p>No Anggota: ${a.noAnggota}</p>
                            <p style="font-size: 1.2rem; color: #db2777;">${a.nama}</p>
                            <hr style="border: 1px solid #fbcfe8; margin: 10px 0;">
                            <p>Total Iuran: Rp ${Number(a.totalIuran || 0).toLocaleString('id-ID')}</p>
                            <p>Status: ${a.statusMenang ? 'SUDAH MENANG' : 'BELUM MENANG'}</p>
                        </div>
                        <script>window.print();<\/script></body></html>
                    `);
                    printWindow.document.close();
                };

                const hitungKasArisan = (rt, rw) => {
                    const totalMasuk = listArisan.value.filter(x => x.rt == rt && x.rw == rw).reduce((sum, curr) => sum + Number(curr.totalIuran || 0), 0);
                    const totalKeluar = riwayatArisan.value.filter(x => x.rt == rt && x.rw == rw).reduce((sum, curr) => sum + Number(curr.nominal || 0), 0);
                    return Math.max(0, totalMasuk - totalKeluar);
                };

                const hitungKasSumbangan = () => {
                    return listSumbangan.value.filter(x => x.rt == user.value.rt && x.rw == user.value.rw && x.status === 'Divalidasi').reduce((sum, curr) => sum + Number(curr.nominal || 0), 0);
                };

                const downloadExcelData = (type) => {
                    let data = [];
                    let filename = 'Data_Export.csv';
                    if(type === 'kependudukan') {
                        data = listWarga.value.map(w => ({ NIK: w.nik, Nama: w.nama, Kelamin: w.kelamin, TempatLahir: w.tempat_lahir, TanggalLahir: w.tgl_lahir, Pendidikan: w.pendidikan, Pekerjaan: w.pekerjaan, Alamat: `${w.alamat} RT ${w.rt} RW ${w.rw}`, HP: w.hp1 }));
                        filename = 'Data_Kependudukan.csv';
                    } else if(type === 'surat') {
                        data = listSuratPengantar.value.map(s => ({ Tanggal: s.tanggal, Nama: s.nama, NIK: s.nik, Keperluan: s.keperluan, Status: s.statusAdmin }));
                        filename = 'Rekap_Surat_Warga.csv';
                    }
                    if(data.length === 0) return showToast('Tidak ada data untuk didownload', 'warning');
                    
                    const headers = Object.keys(data[0]).join(',');
                    const csvRows = data.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
                    const csvString = [headers, ...csvRows].join('\n');
                    
                    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = filename;
                    link.click();
                };

                const getNamaBulan = () => {
                    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
                    return months[new Date().getMonth()];
                };

                const formatTgl = (tgl) => {
                    if(!tgl) return '-';
                    const d = new Date(tgl);
                    return `${d.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][d.getMonth()]} ${d.getFullYear()}`;
                };

                // COMPUTED PROPERTIES
                const wargaUlangTahun = computed(() => {
                    const currentMonth = new Date().getMonth() + 1;
                    return listWarga.value.filter(w => {
                        if(!w.tgl_lahir) return false;
                        const m = parseInt(w.tgl_lahir.split('-')[1]);
                        return m === currentMonth;
                    });
                });

                const statistikGender = computed(() => {
                    return {
                        l: listWarga.value.filter(w => w.kelamin === 'Laki-laki').length,
                        p: listWarga.value.filter(w => w.kelamin === 'Perempuan').length
                    };
                });

                const statistikUsia = computed(() => {
                    const res = { balita: 0, anak: 0, remaja: 0, dewasa: 0, lansia: 0 };
                    const currentYear = new Date().getFullYear();
                    listWarga.value.forEach(w => {
                        if(!w.tgl_lahir) return;
                        const y = parseInt(w.tgl_lahir.split('-')[0]);
                        const age = currentYear - y;
                        if(age <= 5) res.balita++;
                        else if(age <= 12) res.anak++;
                        else if(age <= 25) res.remaja++;
                        else if(age <= 59) res.dewasa++;
                        else res.lansia++;
                    });
                    return res;
                });

                const rekapPekerjaan = computed(() => {
                    const map = {};
                    listWarga.value.forEach(w => {
                        const pk = (w.pekerjaan || 'Belum/Tidak Bekerja').trim().toLowerCase();
                        map[pk] = (map[pk] || 0) + 1;
                    });
                    return map;
                });

                const rekapKasAdmin = computed(() => {
                    const rtrwSet = new Set();
                    listSumbangan.value.forEach(s => {
                        if(s.rt && s.rw) rtrwSet.add(`RT ${s.rt} / RW ${s.rw}`);
                    });
                    const result = [];
                    rtrwSet.forEach(wilayah => {
                        const [rtStr, rwStr] = wilayah.split(' / ');
                        const rt = rtStr.replace('RT ', '');
                        const rw = rwStr.replace('RW ', '');
                        const total = listSumbangan.value.filter(x => x.rt == rt && x.rw == rw && x.status === 'Divalidasi').reduce((sum, curr) => sum + Number(curr.nominal || 0), 0);
                        result.push({ wilayah, total });
                    });
                    const totalAll = result.reduce((sum, curr) => sum + curr.total, 0);
                    if(result.length > 0) result.unshift({ wilayah: 'TOTAL SELURUH RW/RT', total: totalAll });
                    return result;
                });

                const filteredPengajuanUsaha = computed(() => {
                    if(user.value.role === 'rt') return listPengajuanUsaha.value.filter(x => x.rt == user.value.rt);
                    if(user.value.role === 'rw') return listPengajuanUsaha.value.filter(x => x.rw == user.value.rw);
                    if(user.value.role === 'admin_kelurahan') return listPengajuanUsaha.value;
                    return [];
                });

                return {
                    isLoggedIn, currentAuthView, isRegistering, isRegisteringLuar, regStep, sidebarOpen, menu, user,
                    publicTab, tabArisan, notification, dialog, executeDialog, zoomedImage, selectedWarga, webSettings, adminAccount,
                    showFormUmkm, showFormGaleri, showFormBursa, showFormFasilitas, showFormAgenda, showFormSuratWarga,
                    showFormBansos, showFormAdministrasi, showFormTamu, showFormLaporan, showFormPengajuan, showFormSumbangan,
                    showPassLogin, showPassReg, showPassRegRep, showPassRegLuar, showPassAdmin, showPassPejabat,
                    loginForm, reg, regLuar, formWargaTtd, formAdmin, formPejabat, formBendahara, formTamu, formLaporan,
                    formSumbangan, formSumbanganWarga, formArisan, formUsahaLuar, formSuratPengantar, formUmkm, formGaleri,
                    formBursa, formFasilitas, formBansos, formAnggaran, formSampah, formAgenda,
                    listPejabat, listBendahara, listTamu, listLaporan, listSumbangan, listArisan, riwayatArisan, logAktivitas,
                    listWarga, listWargaLuar, listPengajuanUsaha, listSuratPengantar, listUmkm, listGaleri, listBursa,
                    listFasilitas, listBansos, listAnggaran, listSampah, listAgenda,
                    statistikGender, statistikUsia, rekapPekerjaan, rekapKasAdmin, wargaUlangTahun, filteredPengajuanUsaha,
                    handleLogin, handleRegister, handleRegisterLuar, logout, getPejabatSetting, simpanPengaturanPejabat,
                    simpanWebSettings, updateAdmin, simpanTtdWarga, simpanSuratPengantar, setujuiPengantar, cetakPengantarWarga,
                    simpanTamu, simpanBendahara, kirimSumbanganWarga, simpanSumbangan, validasiSumbangan, simpanBansos,
                    simpanAnggaran, simpanUmkm, simpanGaleri, simpanBursa, simpanFasilitas, simpanAgenda, simpanPengajuanUsaha,
                    setujuiUsaha, cetakSuratUsaha, simpanPejabat, hapus, simpanLaporan, balasKomentar, daftarArisanWarga,
                    simpanArisan, tambahIuranManual, kocokArisan, cetakKartuArisan, hitungKasArisan, hitungKasSumbangan,
                    downloadExcelData, getNamaBulan, formatTgl, customConfirm, customPrompt, uploadFile
                };
            }
        }).mount('#app');
    
