/**
 * RoomCheck IT Del - Unified System (Portal Mahasiswa Pelapor & Dashboard Kerja Teknisi)
 */

class RoomCheckApp {
    constructor() {
        this.tickets = [];
        this.currentRole = 'student'; // 'student' | 'technician'
        this.currentTechUser = 'all'; // 'all' | 'Pak Hotman (Air)' | 'Pak Simanjuntak (Listrik)' | 'Pak Manurung (Kunci)'
        this.selectedCategoryFilter = 'all';
        this.selectedStatusFilter = 'all';
        this.searchQuery = '';
        this.currentSelectedTicket = null;
        this.darkMode = false;

        this.init();
    }

    init() {
        this.loadTickets();
        this.renderStats();
        this.renderTickets();
        this.renderTechnicianFeed();
        this.setupEventListeners();
    }

    // ==========================================
    // LocalStorage Persistence
    // ==========================================
    loadTickets() {
        try {
            const saved = localStorage.getItem('roomcheck_itdel_unified_tickets');
            if (saved) {
                this.tickets = JSON.parse(saved);
            } else {
                this.tickets = JSON.parse(JSON.stringify(INITIAL_REPORTS));
                this.saveTickets();
            }
        } catch (e) {
            this.tickets = JSON.parse(JSON.stringify(INITIAL_REPORTS));
        }
    }

    saveTickets() {
        try {
            localStorage.setItem('roomcheck_itdel_unified_tickets', JSON.stringify(this.tickets));
        } catch (e) {
            console.error("Gagal menyimpan tiket:", e);
        }
    }

    // ==========================================
    // Render Statistics & Counters
    // ==========================================
    renderStats() {
        const total = this.tickets.length;
        const pending = this.tickets.filter(t => t.status === 'pending').length;
        const inProgress = this.tickets.filter(t => t.status === 'in-progress').length;
        const resolved = this.tickets.filter(t => t.status === 'resolved').length;

        const statTotalEl = document.getElementById('stat-total');
        const statPendingEl = document.getElementById('stat-pending');
        const statProgressEl = document.getElementById('stat-progress');
        const statResolvedEl = document.getElementById('stat-resolved');

        if (statTotalEl) statTotalEl.textContent = total;
        if (statPendingEl) statPendingEl.textContent = pending;
        if (statProgressEl) statProgressEl.textContent = inProgress;
        if (statResolvedEl) statResolvedEl.textContent = resolved;

        // Technician dashboard stats
        const techPendingCount = document.getElementById('tech-pending-count');
        const techActiveCount = document.getElementById('tech-active-count');
        const techDoneCount = document.getElementById('tech-done-count');
        const rolePendingBadge = document.getElementById('role-pending-badge');

        if (techPendingCount) techPendingCount.textContent = `${pending} Tiket`;
        if (techActiveCount) techActiveCount.textContent = `${inProgress} Tiket`;
        if (techDoneCount) techDoneCount.textContent = `${resolved} Tiket`;
        if (rolePendingBadge) rolePendingBadge.textContent = pending;
    }

    // ==========================================
    // Student View: Render Tickets
    // ==========================================
    renderTickets() {
        const container = document.getElementById('tickets-feed');
        if (!container) return;

        container.innerHTML = '';

        let filtered = this.tickets.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  t.roomNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  t.dormName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  t.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                  t.description.toLowerCase().includes(this.searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (this.selectedCategoryFilter !== 'all' && t.category !== this.selectedCategoryFilter) {
                return false;
            }

            if (this.selectedStatusFilter !== 'all' && t.status !== this.selectedStatusFilter) {
                return false;
            }

            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius-lg); text-align: center; padding: 48px 20px; color: var(--text-muted);">
                    <h3 style="font-size: 1.1rem; color: var(--text-main);">Tidak Ada Laporan yang Sesuai</h3>
                    <p style="margin-top: 4px; font-size: 0.9rem;">Seluruh fasilitas kamar terpantau dalam kondisi baik atau ubah kata kunci pencarian Anda.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(ticket => {
            const card = document.createElement('div');
            card.className = 'ticket-card';

            let statusClass = 'pending';
            let statusText = 'Menunggu Tindakan Teknisi';
            if (ticket.status === 'in-progress') {
                statusClass = 'in-progress';
                statusText = 'Sedang Dikerjakan Teknisi';
            } else if (ticket.status === 'resolved') {
                statusClass = 'resolved';
                statusText = 'Selesai dan Terverifikasi';
            }

            card.innerHTML = `
                <div class="ticket-top">
                    <div>
                        <div class="ticket-meta">
                            <span class="ticket-id">${ticket.id}</span>
                            <span>•</span>
                            <span>${ticket.dormName}</span>
                            <span>•</span>
                            <span style="color: var(--text-main); font-weight: 800;">${ticket.roomNumber}</span>
                            <span class="urgency-badge ${ticket.urgency}">${ticket.urgencyLabel}</span>
                        </div>
                        <h3 class="ticket-title">${ticket.title}</h3>
                    </div>
                    <span class="status-tag ${statusClass}">
                        ${statusText}
                    </span>
                </div>

                <p class="ticket-desc">${ticket.description}</p>

                <div style="background: var(--border-subtle); padding: 10px 14px; border-radius: var(--radius-md); margin-bottom: 12px; font-size: 0.85rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <div>Teknisi Penanggung Jawab: <strong>${ticket.technician || 'Divisi Sarpras IT Del'}</strong></div>
                    <div>Catatan Terkini: <em>${ticket.notes || 'Menunggu peninjauan lapangan.'}</em></div>
                </div>

                <div class="ticket-footer">
                    <div>
                        <span style="color: var(--text-muted);">Pelapor: <strong>${ticket.reporter.name}</strong> (${ticket.reporter.nim} - ${ticket.reporter.prodi})</span>
                        <span style="margin-left: 8px; color: var(--text-muted); font-size: 0.8rem;">Waktu: ${ticket.reportedAt}</span>
                    </div>

                    <div style="display: flex; gap: 8px;">
                        <button class="btn-secondary" onclick="app.openTicketDetail('${ticket.id}')">
                            Detail Laporan
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // ==========================================
    // Technician View: Render Dashboard Queue
    // ==========================================
    renderTechnicianFeed() {
        const queueContainer = document.getElementById('tech-tickets-feed');
        if (!queueContainer) return;

        queueContainer.innerHTML = '';

        let techTickets = this.tickets.filter(t => {
            if (this.currentTechUser === 'water' && t.category !== 'water') return false;
            if (this.currentTechUser === 'electricity' && t.category !== 'electricity') return false;
            if (this.currentTechUser === 'room' && t.category !== 'room') return false;
            if (this.currentTechUser === 'cleanliness' && t.category !== 'cleanliness') return false;
            return true;
        });

        if (techTickets.length === 0) {
            queueContainer.innerHTML = `
                <div style="background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius-lg); text-align: center; padding: 48px 20px; color: var(--text-muted);">
                    <h3 style="font-size: 1.1rem; color: var(--text-main);">Tidak Ada Antrean Tugas Kerusakan</h3>
                    <p style="margin-top: 4px; font-size: 0.9rem;">Semua kamar pada kategori ini telah selesai diperbaiki.</p>
                </div>
            `;
            return;
        }

        techTickets.forEach(ticket => {
            const card = document.createElement('div');
            card.className = 'ticket-card';
            if (ticket.status === 'pending') {
                card.style.borderLeft = '5px solid var(--rose)';
            } else if (ticket.status === 'in-progress') {
                card.style.borderLeft = '5px solid var(--amber)';
            } else {
                card.style.borderLeft = '5px solid var(--emerald)';
            }

            card.innerHTML = `
                <div class="ticket-top">
                    <div>
                        <div class="ticket-meta">
                            <span class="ticket-id" style="font-size: 1rem; font-weight: 800;">${ticket.id}</span>
                            <span>•</span>
                            <span style="font-weight: 800; color: var(--text-main); font-size: 1rem;">${ticket.dormName} (${ticket.roomNumber})</span>
                            <span class="urgency-badge ${ticket.urgency}">${ticket.urgencyLabel}</span>
                        </div>
                        <h3 class="ticket-title" style="margin-top: 4px;">${ticket.title}</h3>
                    </div>
                    <span class="status-tag ${ticket.status}">
                        ${ticket.statusLabel}
                    </span>
                </div>

                <div style="background: var(--border-subtle); padding: 12px; border-radius: var(--radius-md); font-size: 0.88rem; margin: 10px 0;">
                    <div style="font-weight: 700; color: var(--text-main); margin-bottom: 2px;">Rincian Keluhan Mahasiswa:</div>
                    <div style="color: var(--text-muted); line-height: 1.4;">${ticket.description}</div>
                    <div style="margin-top: 8px; font-size: 0.82rem; color: var(--text-muted);">
                        Kontak Pelapor: <strong>${ticket.reporter.name}</strong> (${ticket.reporter.nim} - ${ticket.reporter.prodi}) • Telp: <strong>${ticket.reporter.phone}</strong>
                    </div>
                </div>

                <div style="margin-bottom: 14px;">
                    <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">Log Pengerjaan Teknisi Terkini:</label>
                    <div style="font-size: 0.88rem; font-style: italic; color: var(--text-main); background: var(--bg-surface); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                        ${ticket.notes || 'Belum ada catatan pengerjaan.'}
                    </div>
                </div>

                <div class="ticket-footer">
                    <span style="font-size: 0.82rem; color: var(--text-muted);">Masuk: ${ticket.reportedAt}</span>

                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <a href="https://wa.me/${ticket.reporter.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(ticket.reporter.name)},%20saya%20teknisi%20Sarpras%20IT%20Del%20terkait%20laporan%20kamar%20${encodeURIComponent(ticket.roomNumber)}" target="_blank" class="btn-secondary" style="color: #059669; border-color: #059669;">
                            Hubungi Mahasiswa
                        </a>

                        <button class="btn-secondary" onclick="app.openUpdateLogModal('${ticket.id}')">
                            Catat Log Perbaikan
                        </button>

                        ${ticket.status === 'pending' ? `
                            <button class="btn-primary btn-amber" onclick="app.technicianAcceptTicket('${ticket.id}')">
                                Terima & Mulai Kerjakan
                            </button>
                        ` : ''}

                        ${ticket.status === 'in-progress' ? `
                            <button class="btn-primary" onclick="app.technicianCompleteTicket('${ticket.id}')" style="background: var(--emerald);">
                                Selesaikan Perbaikan
                            </button>
                        ` : ''}

                        ${ticket.status === 'resolved' ? `
                            <span style="color: var(--emerald); font-weight: 800; font-size: 0.85rem; display: flex; align-items: center;">
                                Perbaikan Tuntas
                            </span>
                        ` : ''}
                    </div>
                </div>
            `;

            queueContainer.appendChild(card);
        });
    }

    // ==========================================
    // Technician Action Handlers
    // ==========================================
    technicianAcceptTicket(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        ticket.status = 'in-progress';
        ticket.statusLabel = 'Sedang Ditangani Teknisi di Kamar';
        ticket.notes = `Tiket diterima oleh ${ticket.technician}. Teknisi sedang menuju lokasi membawa peralatan perbaikan.`;

        this.saveTickets();
        this.renderStats();
        this.renderTickets();
        this.renderTechnicianFeed();

        this.showToast(`Tiket ${ticket.id} diterima! Status diubah menjadi 'Sedang Ditangani'.`);
    }

    technicianCompleteTicket(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        ticket.status = 'resolved';
        ticket.statusLabel = 'Selesai dan Terverifikasi';
        ticket.notes = `Perbaikan selesai dilaksanakan oleh ${ticket.technician}. Fasilitas kamar telah berfungsi normal.`;

        this.saveTickets();
        this.renderStats();
        this.renderTickets();
        this.renderTechnicianFeed();

        this.showToast(`Laporan ${ticket.id} berhasil diselesaikan! Notifikasi terkirim ke mahasiswa.`);
    }

    openUpdateLogModal(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        this.currentSelectedTicket = ticket;

        const modal = document.getElementById('tech-log-modal');
        const idEl = document.getElementById('tech-log-ticket-id');
        const noteInput = document.getElementById('tech-log-input');

        if (idEl) idEl.textContent = `${ticket.id} - ${ticket.dormName} (${ticket.roomNumber})`;
        if (noteInput) noteInput.value = ticket.notes || '';

        if (modal) modal.classList.add('active');
    }

    saveTechnicianLog(e) {
        e.preventDefault();
        if (!this.currentSelectedTicket) return;

        const noteInput = document.getElementById('tech-log-input').value;
        this.currentSelectedTicket.notes = noteInput;

        this.saveTickets();
        this.renderTickets();
        this.renderTechnicianFeed();
        this.closeAllModals();

        this.showToast(`Catatan log teknisi untuk ${this.currentSelectedTicket.id} berhasil disimpan!`);
    }

    // ==========================================
    // Switch Roles (Mahasiswa vs Teknisi)
    // ==========================================
    switchRole(role) {
        this.currentRole = role;

        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));

        const targetBtn = document.querySelector(`[data-role="${role}"]`);
        const targetView = document.getElementById(`view-${role}`);

        if (targetBtn) targetBtn.classList.add('active');
        if (targetView) targetView.classList.add('active');

        this.renderStats();
        if (role === 'student') {
            this.renderTickets();
        } else {
            this.renderTechnicianFeed();
        }
    }

    // ==========================================
    // Submit New Report from Student Form
    // ==========================================
    submitNewReport(e) {
        e.preventDefault();

        const dorm = document.getElementById('new-dorm').value;
        const room = document.getElementById('new-room').value;
        const cat = document.getElementById('new-cat').value;
        const urgency = document.getElementById('new-urgency').value;
        const title = document.getElementById('new-title').value;
        const desc = document.getElementById('new-desc').value;
        const name = document.getElementById('new-name').value;
        const nim = document.getElementById('new-nim').value;
        const prodi = document.getElementById('new-prodi').value;
        const phone = document.getElementById('new-phone').value;

        let icon = '🛠️';
        let catName = 'Fasilitas Kamar';
        let assignedTech = 'Pak Hotman (Teknisi Sarpras IT Del)';
        let techPhone = '+6281377889900';

        if (cat === 'water') {
            icon = '💧';
            catName = 'Air Mati / Saluran Air';
            assignedTech = 'Pak Hotman (Teknisi Pipa & Pompa Air)';
        } else if (cat === 'electricity') {
            icon = '⚡';
            catName = 'Listrik & Stopkontak';
            assignedTech = 'Pak Simanjuntak (Teknisi Listrik & Panel IT Del)';
            techPhone = '+6281233445566';
        } else if (cat === 'room') {
            icon = '🚪';
            catName = 'Kamar & Kunci Pintu';
            assignedTech = 'Pak Manurung (Teknisi Kayu, Pintu & Kunci)';
            techPhone = '+6282144556677';
        } else if (cat === 'cleanliness') {
            icon = '🧹';
            catName = 'Kebersihan & Sanitasi';
            assignedTech = 'Koordinator Kebersihan Asrama IT Del';
            techPhone = '+6285266778899';
        }

        let urgencyLabel = 'Sedang';
        if (urgency === 'high') urgencyLabel = 'Mendesak / Darurat';
        else if (urgency === 'low') urgencyLabel = 'Ringan';

        const now = new Date();
        const timeStr = `Hari Ini, ${now.getHours() < 10 ? '0' : ''}${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} WIB`;
        const ticketCode = `DEL-SARPRAS-${Math.floor(1000 + Math.random() * 9000)}`;

        const newTicket = {
            id: ticketCode,
            category: cat,
            categoryName: catName,
            icon: icon,
            dormName: dorm,
            roomNumber: room,
            reporter: {
                name: name,
                nim: nim,
                prodi: prodi,
                phone: phone
            },
            urgency: urgency,
            urgencyLabel: urgencyLabel,
            title: title,
            description: desc,
            reportedAt: timeStr,
            status: "pending",
            statusLabel: "Menunggu Tindakan Teknisi",
            technician: assignedTech,
            techPhone: techPhone,
            notes: `Laporan baru masuk ke antrean tugas ${assignedTech}.`
        };

        this.tickets.unshift(newTicket);
        this.saveTickets();
        this.renderStats();
        this.renderTickets();
        this.renderTechnicianFeed();

        document.getElementById('form-new-report').reset();
        this.openSuccessTicketModal(newTicket);
    }

    openSuccessTicketModal(ticket) {
        const modal = document.getElementById('success-modal');
        const codeEl = document.getElementById('success-ticket-code');
        const techEl = document.getElementById('success-tech-name');
        const waBtn = document.getElementById('success-btn-wa');

        if (codeEl) codeEl.textContent = ticket.id;
        if (techEl) techEl.textContent = `${ticket.technician} (${ticket.techPhone})`;

        if (waBtn) {
            const waText = encodeURIComponent(
                `*LAPORAN RESMI KERUSAKAN ASRAMA IT DEL*\n\n` +
                `No. Tiket: ${ticket.id}\n` +
                `Pelapor: ${ticket.reporter.name} (${ticket.reporter.nim} - ${ticket.reporter.prodi})\n` +
                `No. Kontak: ${ticket.reporter.phone}\n` +
                `Lokasi: ${ticket.dormName}, ${ticket.roomNumber}\n` +
                `Kategori: ${ticket.categoryName}\n` +
                `Tingkat Urgensi: ${ticket.urgencyLabel}\n` +
                `Kendala: ${ticket.title}\n` +
                `Rincian: ${ticket.description}\n\n` +
                `Mohon bantuan teknisi Sarpras IT Del untuk segera mengecek lokasi. Terima kasih.`
            );
            waBtn.href = `https://wa.me/${ticket.techPhone.replace(/[^0-9]/g, '')}?text=${waText}`;
        }

        if (modal) modal.classList.add('active');
    }

    openTicketDetail(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        this.currentSelectedTicket = ticket;

        const modal = document.getElementById('detail-modal');
        const idEl = document.getElementById('detail-id');
        const titleEl = document.getElementById('detail-title');
        const dormEl = document.getElementById('detail-dorm');
        const reporterEl = document.getElementById('detail-reporter');
        const descEl = document.getElementById('detail-desc');
        const statusEl = document.getElementById('detail-status');
        const techEl = document.getElementById('detail-tech');
        const notesEl = document.getElementById('detail-notes');
        const btnWa = document.getElementById('detail-btn-wa');

        if (idEl) idEl.textContent = ticket.id;
        if (titleEl) titleEl.textContent = ticket.title;
        if (dormEl) dormEl.textContent = `${ticket.dormName} • ${ticket.roomNumber} (${ticket.urgencyLabel})`;
        if (reporterEl) reporterEl.textContent = `${ticket.reporter.name} (${ticket.reporter.nim} - ${ticket.reporter.prodi}) • ${ticket.reporter.phone}`;
        if (descEl) descEl.textContent = ticket.description;
        if (statusEl) statusEl.textContent = ticket.statusLabel || ticket.status;
        if (techEl) techEl.textContent = `${ticket.technician || 'Tim Sarpras'} (${ticket.techPhone || '-'})`;
        if (notesEl) notesEl.textContent = ticket.notes || "Belum ada catatan penanganan teknisi.";

        if (btnWa) {
            const waMsg = encodeURIComponent(
                `Halo ${ticket.technician}, saya mahasiswa penghuni ${ticket.dormName} ${ticket.roomNumber} menanyakan tindak lanjut perbaikan No. Tiket ${ticket.id}: ${ticket.title}. Terima kasih.`
            );
            btnWa.href = `https://wa.me/${(ticket.techPhone || '6281377889900').replace(/[^0-9]/g, '')}?text=${waMsg}`;
        }

        if (modal) modal.classList.add('active');
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 4000);
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    setupEventListeners() {
        // Role Switcher Buttons
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchRole(btn.dataset.role);
            });
        });

        // Technician Filter Select
        const techFilterSelect = document.getElementById('tech-user-select');
        if (techFilterSelect) {
            techFilterSelect.addEventListener('change', (e) => {
                this.currentTechUser = e.target.value;
                this.renderTechnicianFeed();
            });
        }

        // Form Submit
        const formNew = document.getElementById('form-new-report');
        if (formNew) {
            formNew.addEventListener('submit', (e) => this.submitNewReport(e));
        }

        // Form Log Submit
        const formLog = document.getElementById('form-tech-log');
        if (formLog) {
            formLog.addEventListener('submit', (e) => this.saveTechnicianLog(e));
        }

        // Search Input
        const searchInput = document.getElementById('search-report');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderTickets();
            });
        }

        // Filter Pills
        document.querySelectorAll('.pill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (btn.dataset.status) {
                    this.selectedStatusFilter = btn.dataset.status;
                } else if (btn.dataset.category) {
                    this.selectedCategoryFilter = btn.dataset.category;
                }
                this.renderTickets();
            });
        });

        // Dark Mode Toggle
        const themeBtn = document.getElementById('btn-toggle-theme');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.darkMode = !this.darkMode;
                if (this.darkMode) {
                    document.body.classList.add('dark-mode');
                    themeBtn.textContent = 'Mode Terang';
                } else {
                    document.body.classList.remove('dark-mode');
                    themeBtn.textContent = 'Mode Gelap';
                }
            });
        }

        // Close modal handlers
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new RoomCheckApp();
});
