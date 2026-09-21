const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const form = $('#case-form');
const STORAGE_KEY = 'pa-sekayu-draft-v1';
const today = new Date().toISOString().slice(0, 10);
$('input[name="entryDate"]').value = today;

function parseDate(value) { const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? null : date; }
function ageFromDate(value, on = new Date()) {
  const birth = parseDate(value); if (!birth || birth > on) return null;
  let age = on.getFullYear() - birth.getFullYear();
  const beforeBirthday = on.getMonth() < birth.getMonth() || (on.getMonth() === birth.getMonth() && on.getDate() < birth.getDate());
  if (beforeBirthday) age--; return age >= 0 ? age : null;
}
function durationFromDate(value) { const age = ageFromDate(value); return age === null ? '' : `${age} tahun`; }
function formatDate(value) { const date = parseDate(value); return date ? date.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' }) : ''; }
function nikDetails(nik) {
  const clean = nik.replace(/\D/g, ''); if (clean.length !== 16) return { error: 'NIK harus terdiri dari 16 digit.' };
  const day = Number(clean.slice(6, 8)); const month = Number(clean.slice(8, 10)); const year = Number(clean.slice(10, 12));
  const female = day > 40; const realDay = female ? day - 40 : day; const fullYear = year <= Number(String(new Date().getFullYear()).slice(2)) ? 2000 + year : 1900 + year;
  const candidate = `${fullYear}-${String(month).padStart(2, '0')}-${String(realDay).padStart(2, '0')}`;
  const date = parseDate(candidate);
  if (!date || date.getFullYear() !== fullYear || date.getMonth() + 1 !== month || date.getDate() !== realDay || date > new Date()) return { error: 'Tanggal lahir pada NIK tidak valid.' };
  return { date: candidate, gender: female ? 'Perempuan' : 'Laki-laki' };
}
function wireParty(prefix) {
  const nik = $(`[name="${prefix}Nik"]`), birth = $(`[name="${prefix}BirthDate"]`), age = $(`[name="${prefix}Age"]`), gender = $(`[name="${prefix}Gender"]`), hint = $(`#${prefix}NikHint`);
  function updateAge() { age.value = birth.value ? (ageFromDate(birth.value) === null ? '' : `${ageFromDate(birth.value)} tahun`) : ''; }
  nik.addEventListener('input', () => {
    nik.value = nik.value.replace(/\D/g, '').slice(0, 16);
    if (!nik.value) { hint.textContent = prefix === 'a' ? 'Tanggal lahir pada NIK akan dibaca otomatis.' : 'Opsional jika NIK tidak tersedia.'; hint.classList.remove('error'); return; }
    const result = nikDetails(nik.value);
    if (result.error) { hint.textContent = result.error; hint.classList.add('error'); return; }
    birth.value = result.date; gender.value = result.gender; updateAge(); hint.textContent = `Terbaca: ${formatDate(result.date)} · ${result.gender}`; hint.classList.remove('error');
  });
  birth.addEventListener('input', updateAge); updateAge();
}
wireParty('a'); wireParty('b');
$('input[name="marriageDate"]').addEventListener('input', e => { $('input[name="marriageDuration"]').value = durationFromDate(e.target.value); });
function addChild(data = {}) {
  const list = $('#children-list'); $('.empty-state', list)?.remove();
  const row = document.createElement('div'); row.className = 'child-row';
  row.innerHTML = `<label>Nama anak<input name="childName" value="${escapeHtml(data.name || '')}" placeholder="Nama lengkap" /></label><label>Tempat lahir<input name="childPlace" value="${escapeHtml(data.place || '')}" /></label><label>Tanggal lahir<input name="childBirth" type="date" value="${escapeHtml(data.birth || '')}" /><small class="hint child-age">${data.birth ? durationFromDate(data.birth) : 'Umur otomatis'}</small></label><button type="button" class="remove-child" title="Hapus anak">×</button>`;
  $('input[name="childBirth"]', row).addEventListener('input', e => $('.child-age', row).textContent = e.target.value && ageFromDate(e.target.value) !== null ? `${ageFromDate(e.target.value)} tahun` : 'Umur otomatis');
  $('.remove-child', row).addEventListener('click', () => { row.remove(); if (!$('#children-list .child-row')) $('#children-list').innerHTML = '<div class="empty-state">Belum ada data anak. Klik “Tambah anak” bila diperlukan.</div>'; });
  list.append(row);
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
$('#add-child').addEventListener('click', () => addChild());
$$('textarea[data-counter], textarea').forEach(area => { const counter = $(`.counter[data-for="${area.name}"]`); if (counter) { const update = () => counter.textContent = `${area.value.length.toLocaleString('id-ID')} karakter`; area.addEventListener('input', update); update(); } });
$$('input[name="caseType"]').forEach(input => input.addEventListener('change', () => { $$('.choice').forEach(choice => choice.classList.toggle('selected', $('input', choice).checked)); const talak = input.value === 'cerai-talak' && input.checked; $('#party-title').textContent = talak ? 'Pemohon & Termohon' : 'Penggugat & Tergugat'; $('#party-a-label').textContent = talak ? 'Data Pemohon' : 'Data Penggugat'; $('#party-b-label').textContent = talak ? 'Data Termohon' : 'Data Tergugat'; }));
function collect() { const data = {}; [...new FormData(form).entries()].forEach(([key, value]) => { if (key !== 'caseType') data[key] = value; }); data.caseType = $('input[name="caseType"]:checked').value; data.children = $$('.child-row').map(row => ({ name: $('input[name="childName"]', row).value, place: $('input[name="childPlace"]', row).value, birth: $('input[name="childBirth"]', row).value })); return data; }
function showAlert(message, type = 'success') { const alert = $('#alert'); alert.textContent = message; alert.className = `alert ${type}`; window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => alert.classList.add('hidden'), 4500); }
function saveDraft(silent = false) { localStorage.setItem(STORAGE_KEY, JSON.stringify(collect())); if (!silent) showAlert('Konsep perkara tersimpan di perangkat ini.'); }
$('#save-draft').addEventListener('click', () => saveDraft());
form.addEventListener('input', () => { clearTimeout(window.saveTimer); window.saveTimer = setTimeout(() => saveDraft(true), 700); });
$('#reset-form').addEventListener('click', () => { if (!confirm('Hapus seluruh isian formulir dan konsep lokal?')) return; localStorage.removeItem(STORAGE_KEY); form.reset(); $('input[name="entryDate"]').value = today; $('#children-list').innerHTML = '<div class="empty-state">Belum ada data anak. Klik “Tambah anak” bila diperlukan.</div>'; $$('[name$="Age"], [name$="Gender"], [name="marriageDuration"]').forEach(input => input.value = ''); showAlert('Formulir telah dibersihkan.'); });
form.addEventListener('submit', event => { event.preventDefault(); const invalid = $$('[required]', form).filter(input => !input.value.trim()); if (invalid.length) { invalid[0].focus(); showAlert(`Masih ada ${invalid.length} kolom wajib yang belum diisi.`, 'error'); return; } const aNik = $('input[name="aNik"]').value; if (nikDetails(aNik).error) { $('input[name="aNik"]').focus(); showAlert('Periksa NIK Penggugat/Pemohon sebelum melanjutkan.', 'error'); return; } saveDraft(true); showAlert('Data valid dan konsep tersimpan. Modul generator DOCX/PDF akan menggunakan data ini.'); });
(function loadDraft() { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return; try { const data = JSON.parse(raw); Object.entries(data).forEach(([key, value]) => { if (key === 'children' || key === 'caseType') return; const field = form.elements[key]; if (field) field.value = value; }); if (data.caseType) { const radio = $(`input[name="caseType"][value="${data.caseType}"]`); if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change')); } } (data.children || []).forEach(addChild); ['a','b'].forEach(prefix => { const nik = $(`[name="${prefix}Nik"]`); if (nik.value) nik.dispatchEvent(new Event('input')); }); $('input[name="marriageDate"]').dispatchEvent(new Event('input')); showAlert('Konsep terakhir telah dimuat dari penyimpanan lokal.'); } catch { localStorage.removeItem(STORAGE_KEY); } })();
