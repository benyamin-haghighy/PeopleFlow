(function () {
  const root = document.getElementById('page-root');
  const page = document.body.dataset.page;
  const expectedRole = document.body.dataset.role;
  const user = HRApi.getUser();
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fa = (value) => value === null || value === undefined || value === '' ? '—' : Number(value).toLocaleString('fa-IR');
  const money = (value) => value === null || value === undefined ? '—' : `${Number(value).toLocaleString('fa-IR')}`;
  const dateFa = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return esc(value);
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeZone: 'Asia/Tehran' }).format(d);
  };
  const dateInput = (d = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d);
    const get = (k) => parts.find(p => p.type === k).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  };
  const statusBadge = (status) => {
    const map = { PAYED:['پرداخت‌شده','success'], PENDING:['در انتظار پرداخت','warning'], present:['حاضر','success'], absent:['غایب','danger'], incomplete:['ناقص','warning'] };
    const item = map[status] || [status || 'نامشخص','info'];
    return `<span class="badge ${item[1]}">${esc(item[0])}</span>`;
  };
  const showToast = (message, type = 'success') => {
    const region = $('#toast-region');
    if (!region) return;
    const node = document.createElement('div'); node.className = `toast ${type}`; node.textContent = message; region.appendChild(node);
    setTimeout(() => node.remove(), 3600);
  };
  const showError = (error) => showToast(error?.message || 'عملیات انجام نشد', 'error');
  const setLoading = (text = 'در حال دریافت اطلاعات…') => { root.innerHTML = `<div class="loading-state"><span class="spinner"></span>${esc(text)}</div>`; };
  const pageHeading = (title, description, action = '') => `<div class="page-heading"><div><h1>${title}</h1><p>${description || ''}</p></div><div class="page-actions">${action}</div></div>`;
  const panel = (title, body, extra = '') => `<section class="panel"><div class="panel-head"><div><h2>${title}</h2></div>${extra}</div>${body}</section>`;
  const table = (headers, rows, empty = 'اطلاعاتی برای نمایش وجود ندارد') => `<div class="table-panel"><div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows || `<tr><td colspan="${headers.length}"><div class="empty-state">${empty}</div></td></tr>`}</tbody></table></div></div>`;
  const openModal = (title, content, onReady) => {
    const host = $('#modal-root');
    host.innerHTML = `<div class="modal-backdrop" data-close-modal><section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${title}</h2><button class="modal-close" type="button" data-close-modal>×</button></div>${content}</section></div>`;
    $('.modal', host).addEventListener('click', e => e.stopPropagation());
    host.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', e => { if (e.target === el || el.tagName === 'BUTTON') host.innerHTML = ''; }));
    if (onReady) onReady(host);
  };
  const formField = (label, name, value = '', type = 'text', attrs = '') => `<label class="field">${label}<input name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
  const userInitials = (name) => (name || 'HR').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();

  async function boot() {
    if (!user || !user.id) { location.replace('/login'); return; }
    if (user.role !== expectedRole) { location.replace(user.role === 'MANAGER' ? '/manager' : '/employee'); return; }
    try {
      await HRApi.refreshAccessToken();
      const name = user.name || 'کاربر';
      $('#user-name').textContent = name;
      $('#user-avatar').textContent = userInitials(name);
      $('#user-role').textContent = user.role === 'MANAGER' ? 'مدیر سامانه' : 'کارمند';
      const active = $(`[data-nav="${page}"]`); if (active) active.classList.add('active');
      await renderPage();
    } catch (error) {
      HRApi.expireSession();
    }
  }

  async function renderPage() {
    setLoading();
    try {
      switch (page) {
        case 'manager-dashboard': return await managerDashboard();
        case 'manager-departments': return await managerDepartments();
        case 'manager-groups': return await managerGroups();
        case 'manager-payroll': return await managerPayroll();
        case 'manager-create-manager': return await managerCreateManager();
        case 'employee-dashboard': return await employeeDashboard();
        case 'employee-attendance': return await employeeAttendance();
        case 'employee-payroll': return await employeePayroll();
        case 'employee-departments': return await employeeDepartments();
        case 'employee-account': return employeeAccount();
        default: root.innerHTML = '<div class="empty-box">صفحه موردنظر پیدا نشد.</div>';
      }
    } catch (error) { root.innerHTML = `<div class="notice error">${esc(error.message)}</div>`; }
  }

  async function managerDashboard() {
    const results = await Promise.allSettled([HRApi.get('/manager-data/departments'), HRApi.get('/manager/payrolle/groups'), HRApi.get('/manager/payrolle')]);
    const [departments, groups, payrolls] = results.map(r => r.status === 'fulfilled' ? r.value : []);
    const depts = Array.isArray(departments) ? departments : [];
    const grps = Array.isArray(groups) ? groups : [];
    const pays = Array.isArray(payrolls) ? payrolls : [];
    const paid = pays.filter(x => x.status === 'PAYED').length;
    const pending = pays.filter(x => x.status === 'PENDING').length;
    const stats = [ ['▦','دپارتمان‌ها',depts.length], ['◫','گروه‌های شغلی',grps.length], ['▤','کل فیش‌ها',pays.length], ['✓','پرداخت‌شده',paid] ];
    root.innerHTML = pageHeading('نمای کلی سازمان','خلاصه‌ای از داده‌های ثبت‌شده در سامانه') + `<div class="stats-grid">${stats.map(s=>`<article class="stat-card"><span class="stat-icon">${s[0]}</span><div><small>${s[1]}</small><strong>${fa(s[2])}</strong></div></article>`).join('')}</div><div class="grid-two">${panel('آخرین دپارتمان‌ها', table(['شناسه','نام دپارتمان','تاریخ ایجاد'], depts.slice(0,5).map(d=>`<tr><td>${fa(d.id)}</td><td>${esc(d.name)}</td><td>${dateFa(d.created_at)}</td></tr>`).join('')))}${panel('وضعیت فیش‌های حقوقی', `<div class="detail-grid"><div class="detail-item"><small>در انتظار پرداخت</small><b>${fa(pending)}</b></div><div class="detail-item"><small>پرداخت‌شده</small><b>${fa(paid)}</b></div></div><p class="muted" style="font-size:11px;line-height:2;margin-top:16px">این آمار از فهرست فیش‌هایی محاسبه شده که API فعلی برمی‌گرداند؛ تعداد کارکنان در API موجود ارائه نشده است.</p>`)}</div>`;
  }

  async function managerDepartments() {
    const data = await HRApi.get('/manager-data/departments');
    const list = Array.isArray(data) ? data : [];
    const rows = list.map(d=>`<tr><td>${fa(d.id)}</td><td><b>${esc(d.name)}</b></td><td>${esc(d.description || '—')}</td><td>${dateFa(d.created_at)}</td><td><div class="action-row"><button class="icon-btn" data-action="department-detail" data-id="${d.id}">جزئیات</button><button class="icon-btn" data-action="department-edit" data-id="${d.id}">ویرایش</button><button class="icon-btn danger" data-action="department-delete" data-id="${d.id}">حذف</button></div></td></tr>`).join('');
    root.innerHTML = pageHeading('مدیریت دپارتمان‌ها','ایجاد، مشاهده، ویرایش و حذف دپارتمان‌های سازمان', '<button class="btn btn-primary" data-action="department-create">＋ دپارتمان جدید</button>') + `<section class="panel"><div class="toolbar"><label class="field" style="min-width:230px">جست‌وجو<input id="department-search" placeholder="نام یا توضیحات دپارتمان"></label><span class="muted" style="font-size:11px">${fa(list.length)} دپارتمان ثبت‌شده</span></div><div id="department-table">${table(['شناسه','نام','توضیحات','تاریخ ایجاد','عملیات'], rows)}</div></section>`;
    $('#department-search').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = list.filter(d => `${d.name} ${d.description || ''}`.toLowerCase().includes(q));
      $('#department-table').innerHTML = table(['شناسه','نام','توضیحات','تاریخ ایجاد','عملیات'], filtered.map(d=>`<tr><td>${fa(d.id)}</td><td><b>${esc(d.name)}</b></td><td>${esc(d.description || '—')}</td><td>${dateFa(d.created_at)}</td><td><div class="action-row"><button class="icon-btn" data-action="department-detail" data-id="${d.id}">جزئیات</button><button class="icon-btn" data-action="department-edit" data-id="${d.id}">ویرایش</button><button class="icon-btn danger" data-action="department-delete" data-id="${d.id}">حذف</button></div></td></tr>`).join(''));
    });
  }
  function departmentForm(item = {}) {
    const editing = Boolean(item.id);
    openModal(editing ? 'ویرایش دپارتمان' : 'ایجاد دپارتمان', `<form id="department-form"><div class="form-grid">${formField('نام دپارتمان','name',item.name || '','text','required minlength="2" maxlength="100"')}<label class="field full">توضیحات<textarea name="description" placeholder="توضیحات تکمیلی">${esc(item.description || '')}</textarea></label></div><div class="modal-actions"><button class="btn btn-primary" type="submit">${editing?'ذخیره تغییرات':'ایجاد دپارتمان'}</button><button class="btn btn-secondary" type="button" data-close-modal>انصراف</button></div></form>`, host => {
      $('#department-form',host).addEventListener('submit', async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const payload={name:String(f.get('name')).trim(),description:String(f.get('description')||'').trim()};try{if(editing)await HRApi.patch(`/manager-data/departments/${item.id}`,payload);else await HRApi.post('/manager-data/departments',payload);host.innerHTML='';showToast(editing?'دپارتمان ویرایش شد':'دپارتمان ایجاد شد');await managerDepartments();}catch(err){showToast(err.message,'error');}});
    });
  }
  async function departmentDetail(id) {
    try { const d=await HRApi.get(`/manager-data/departments/${id}`); openModal('جزئیات دپارتمان',`<div class="detail-grid"><div class="detail-item"><small>شناسه</small><b>${fa(d.id)}</b></div><div class="detail-item"><small>نام</small><b>${esc(d.name)}</b></div><div class="detail-item"><small>تاریخ ایجاد</small><b>${dateFa(d.created_at)}</b></div><div class="detail-item" style="grid-column:1/-1"><small>توضیحات</small><b>${esc(d.description||'—')}</b></div></div>`); } catch(e){showError(e);}
  }

  async function managerGroups() {
    const groups = await HRApi.get('/manager/payrolle/groups');
    const list = Array.isArray(groups) ? groups : [];
    const localSalaries = JSON.parse(sessionStorage.getItem('hr_new_base_salaries') || '[]');
    const known = [...new Map([...list.map(g=>g.baseSalary).filter(Boolean),...localSalaries].map(s=>[s.id,s])).values()];
    const rows = list.map(g=>`<tr><td>${fa(g.id)}</td><td><b>${esc(g.name)}</b></td><td>${fa(g.baseSalary?.id)}</td><td>${money(g.baseSalary?.baseSalary)}</td><td><button class="icon-btn" data-action="group-edit" data-id="${g.id}">تغییر پایه حقوق</button></td></tr>`).join('');
    root.innerHTML = pageHeading('گروه‌های شغلی و پایه حقوق','مدیریت گروه‌ها و اتصال آن‌ها به پایه حقوق') + `<div class="grid-two"><section class="panel"><div class="panel-head"><h2>ایجاد پایه حقوق</h2></div><form id="base-salary-form"><div class="field"><label>مبلغ پایه حقوق</label><input name="baseSalary" type="number" min="1" step="1" required placeholder="مثلاً 25000000"></div><div class="form-actions"><button class="btn btn-primary" type="submit">ثبت پایه حقوق</button></div></form><p class="field-help">API فعلی امکان دریافت فهرست مستقل پایه حقوق را ندارد؛ شناسه پایه حقوق پس از ایجاد در همین نشست نمایش داده می‌شود.</p></section><section class="panel"><div class="panel-head"><h2>ایجاد گروه شغلی</h2></div><form id="group-form"><div class="form-grid"><label class="field full">نام گروه<input name="name" required placeholder="مثلاً Junior"></label><label class="field full">شناسه پایه حقوق<input name="baseSalaryId" type="number" min="1" required placeholder="شناسه پایه حقوق"></label></div><div class="form-actions"><button class="btn btn-primary" type="submit">ایجاد گروه</button></div></form></section></div><section class="panel"><div class="panel-head"><h2>گروه‌های ثبت‌شده</h2><span class="badge info">${fa(list.length)} گروه</span></div>${table(['شناسه','نام گروه','شناسه پایه','مبلغ پایه حقوق','عملیات'],rows)}</section><section class="panel"><div class="panel-head"><h2>پایه‌های حقوق شناخته‌شده</h2></div>${table(['شناسه','مبلغ پایه حقوق'],known.map(s=>`<tr><td>${fa(s.id)}</td><td>${money(s.baseSalary)}</td></tr>`).join(''))}</section>`;
    $('#base-salary-form').addEventListener('submit', async e=>{e.preventDefault();const amount=Number(new FormData(e.currentTarget).get('baseSalary'));try{const created=await HRApi.post('/manager/payrolle/base-salary',{baseSalary:amount});const saved=JSON.parse(sessionStorage.getItem('hr_new_base_salaries')||'[]');saved.unshift(created);sessionStorage.setItem('hr_new_base_salaries',JSON.stringify(saved));showToast(`پایه حقوق ایجاد شد؛ شناسه: ${created.id}`);await managerGroups();}catch(err){showError(err);}});
    $('#group-form').addEventListener('submit', async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{await HRApi.post('/manager/payrolle/groups',{name:String(f.get('name')).trim(),baseSalaryId:Number(f.get('baseSalaryId'))});showToast('گروه شغلی ایجاد شد');await managerGroups();}catch(err){showError(err);}});
  }
  async function editGroup(id) {
    try {const groups=await HRApi.get('/manager/payrolle/groups');const g=groups.find(x=>x.id===Number(id));if(!g)throw new Error('گروه پیدا نشد');openModal('تغییر پایه حقوق گروه',`<form id="group-edit-form"><div class="field"><label>گروه شغلی</label><input value="${esc(g.name)}" disabled></div><div class="field" style="margin-top:14px"><label>شناسه پایه حقوق جدید</label><input name="baseSalaryId" type="number" min="1" required value="${g.baseSalary?.id||''}"></div><p class="field-help">شناسه پایه حقوق را از فهرست پایه‌های شناخته‌شده یا مدیر سیستم دریافت کنید.</p><div class="modal-actions"><button class="btn btn-primary">ذخیره</button></div></form>`,host=>$('#group-edit-form',host).addEventListener('submit',async e=>{e.preventDefault();const id2=Number(new FormData(e.currentTarget).get('baseSalaryId'));try{await HRApi.patch(`/manager/payrolle/groups/${id}/base-salary/${id2}`,{});host.innerHTML='';showToast('پایه حقوق گروه تغییر کرد');await managerGroups();}catch(err){showToast(err.message,'error');}}));}catch(e){showError(e);}
  }

  async function managerPayroll() {
    const params=new URLSearchParams();const start=$('#pay-start')?.value;const end=$('#pay-end')?.value;const status=$('#pay-status')?.value;
    if(start)params.set('startDate',start);if(end)params.set('endDate',end);if(status)params.set('status',status);
    const data=await HRApi.get(`/manager/payrolle${params.toString()?`?${params}`:''}`);const list=Array.isArray(data)?data:[];
    const rows=list.map(p=>`<tr><td>${fa(p.id)}</td><td>${fa(p.user_id)}</td><td>${dateFa(p.pay_date)}</td><td>${money(p.totalAmount)}</td><td>${statusBadge(p.status)}</td><td><button class="icon-btn" data-action="payroll-detail" data-id="${p.id}" data-owner="manager">مشاهده و ویرایش</button></td></tr>`).join('');
    root.innerHTML=pageHeading('مدیریت فیش‌های حقوقی','مشاهده، فیلتر و ویرایش فیش‌های تولیدشده توسط سامانه')+`<section class="panel"><form id="payroll-filter" class="toolbar"><label class="field">از تاریخ<input type="date" id="pay-start"></label><label class="field">تا تاریخ<input type="date" id="pay-end"></label><label class="field">وضعیت<select id="pay-status"><option value="">همه وضعیت‌ها</option><option value="PENDING">در انتظار پرداخت</option><option value="PAYED">پرداخت‌شده</option></select></label><button class="btn btn-primary" type="submit">اعمال فیلتر</button><button class="btn btn-secondary" type="button" id="clear-pay-filter">پاک کردن</button></form><div class="panel-head"><h2>فهرست فیش‌ها</h2><span class="badge info">${fa(list.length)} فیش</span></div>${table(['شناسه فیش','شناسه کارمند','تاریخ فیش','مبلغ نهایی','وضعیت','عملیات'],rows)}</section>`;
    $('#payroll-filter').addEventListener('submit',e=>{e.preventDefault();managerPayrollWithFilters();});
    $('#clear-pay-filter').addEventListener('click',()=>{managerPayrollWithFilters(true);});
    async function managerPayrollWithFilters(clear=false){const s=clear?'':$('#pay-start').value;const en=clear?'':$('#pay-end').value;const st=clear?'':$('#pay-status').value;const q=new URLSearchParams();if(s)q.set('startDate',s);if(en)q.set('endDate',en);if(st)q.set('status',st);try{const data=await HRApi.get(`/manager/payrolle${q.toString()?`?${q}`:''}`);const a=Array.isArray(data)?data:[];$('#page-root .panel .table-panel').outerHTML=table(['شناسه فیش','شناسه کارمند','تاریخ فیش','مبلغ نهایی','وضعیت','عملیات'],a.map(p=>`<tr><td>${fa(p.id)}</td><td>${fa(p.user_id)}</td><td>${dateFa(p.pay_date)}</td><td>${money(p.totalAmount)}</td><td>${statusBadge(p.status)}</td><td><button class="icon-btn" data-action="payroll-detail" data-id="${p.id}" data-owner="manager">مشاهده و ویرایش</button></td></tr>`).join(''));if(clear){$('#pay-start').value='';$('#pay-end').value='';$('#pay-status').value='';}}catch(err){showError(err);}}
  }
  async function payrollDetail(id, owner) {
    try {const p=await HRApi.get(owner==='employee'?`/employee/payrolle/${id}`:`/manager/payrolle/${id}`);const editable=owner==='manager';const fields=[['شناسه فیش',p.id],['شناسه کارمند',p.user_id],['تاریخ فیش',dateFa(p.pay_date)],['پایه حقوق',money(p.baseSalary)],['مزایا',money(p.bonuses)],['کسورات',money(p.deduction)],['مبلغ نهایی',money(p.totalAmount)],['وضعیت',p.status==='PAYED'?'پرداخت‌شده':'در انتظار پرداخت'],['تاریخ پرداخت',dateFa(p.payment_date)],['یادداشت',p.note||'—']];
      openModal(editable?'جزئیات و ویرایش فیش':'جزئیات فیش حقوقی',`<div class="detail-grid">${fields.map(f=>`<div class="detail-item"><small>${f[0]}</small><b>${esc(f[1])}</b></div>`).join('')}</div>${editable?`<hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><form id="payroll-edit-form"><div class="form-grid">${formField('مزایا','bonuses',p.bonuses ?? 0,'number','min="0" step="1"')}${formField('کسورات','deduction',p.deduction ?? 0,'number','min="0" step="1"')}<label class="field">وضعیت پرداخت<select name="status"><option value="PENDING" ${p.status==='PENDING'?'selected':''}>در انتظار پرداخت</option><option value="PAYED" ${p.status==='PAYED'?'selected':''}>پرداخت‌شده</option></select></label><label class="field full">یادداشت<textarea name="note">${esc(p.note||'')}</textarea></label></div><p class="field-help">با ذخیره، مجموع فیش طبق منطق بک‌اند به‌روزرسانی می‌شود. تغییر وضعیت به پرداخت‌شده تاریخ پرداخت را ثبت می‌کند.</p><div class="modal-actions"><button class="btn btn-primary">ذخیره تغییرات</button></div></form>`:''}`,host=>{if(editable)$('#payroll-edit-form',host).addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const payload={bonuses:Number(f.get('bonuses')),deduction:Number(f.get('deduction')),status:String(f.get('status')),note:String(f.get('note')||'')};if(!confirm('تغییرات فیش ذخیره شود؟'))return;try{await HRApi.patch(`/manager/payrolle/${id}`,payload);host.innerHTML='';showToast('فیش حقوقی به‌روزرسانی شد');await managerPayroll();}catch(err){showToast(err.message,'error');}});});
    }catch(e){showError(e);}
  }
  async function managerCreateManager() {
    const groups=await HRApi.get('/manager/payrolle/groups');const list=Array.isArray(groups)?groups:[];
    root.innerHTML=pageHeading('ساخت حساب مدیر','ایجاد حساب جدید با نقش مدیر؛ این عملیات فقط برای مدیر احراز هویت‌شده فعال است.')+`<section class="panel" style="max-width:760px"><div class="panel-head"><h2>اطلاعات مدیر جدید</h2></div><form id="create-manager-form"><div class="form-grid"><label class="field">نام و نام خانوادگی<input name="name" required></label><label class="field">شماره موبایل<input name="phone" type="tel" maxlength="11" placeholder="09123456789" required></label><label class="field">رمز عبور<input name="password" type="password" minlength="8" maxlength="16" required></label><label class="field">گروه شغلی<select name="groupId" required><option value="">انتخاب گروه</option>${list.map(g=>`<option value="${g.id}">${esc(g.name)} — ${money(g.baseSalary?.baseSalary)}</option>`).join('')}</select></label></div><div class="form-actions"><button class="btn btn-primary">ایجاد حساب مدیر</button></div></form></section>`;
    $('#create-manager-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const f=new FormData(form);const payload={name:String(f.get('name')).trim(),phone:String(f.get('phone')).trim(),password:String(f.get('password')),groupId:Number(f.get('groupId'))};if(!/^09\d{9}$/.test(payload.phone))return showToast('شماره موبایل معتبر نیست','error');if(!confirm('حساب مدیر با این اطلاعات ایجاد شود؟'))return;try{await HRApi.post('/auth/create-manager',payload);showToast('حساب مدیر با موفقیت ایجاد شد');form.reset();}catch(err){showError(err);}});
  }

  async function employeeDashboard() {
    const today=dateInput();const [attResult,payResult,deptResult]=await Promise.allSettled([HRApi.post('/attendance',{startDate:today,endDate:today}),HRApi.get('/employee/payrolle'),HRApi.get('/employee-data/departments')]);
    const attendance=attResult.status==='fulfilled'&&Array.isArray(attResult.value)?attResult.value:[];const payrolls=payResult.status==='fulfilled'&&Array.isArray(payResult.value)?payResult.value:[];const depts=deptResult.status==='fulfilled'&&Array.isArray(deptResult.value)?deptResult.value:[];const todayRecord=attendance.find(x=>String(x.workDate).slice(0,10)===today);
    root.innerHTML=pageHeading(`سلام ${esc(user.name||'همکار گرامی')}`,'به فضای کاری شخصی خود خوش آمدید')+`<div class="stats-grid"><article class="stat-card"><span class="stat-icon">◷</span><div><small>وضعیت حضور امروز</small><strong style="font-size:15px">${todayRecord?statusBadge(todayRecord.status):'ثبت نشده'}</strong></div></article><article class="stat-card"><span class="stat-icon">▤</span><div><small>فیش‌های حقوقی</small><strong>${fa(payrolls.length)}</strong></div></article><article class="stat-card"><span class="stat-icon">▦</span><div><small>دپارتمان‌های قابل مشاهده</small><strong>${fa(depts.length)}</strong></div></article><article class="stat-card"><span class="stat-icon">✓</span><div><small>آخرین وضعیت پرداخت</small><strong style="font-size:14px">${payrolls[0]?statusBadge(payrolls[0].status):'بدون فیش'}</strong></div></article></div><div class="grid-two">${panel('آخرین سوابق حضور',table(['تاریخ','ورود','خروج','وضعیت'],attendance.map(a=>`<tr><td>${dateFa(a.workDate)}</td><td>${dateFa(a.checkInTime)}</td><td>${dateFa(a.checkOutTime)}</td><td>${statusBadge(a.status)}</td></tr>`).join('')))}${panel('آخرین فیش‌های حقوقی',table(['تاریخ','مبلغ نهایی','وضعیت'],payrolls.slice(0,5).map(p=>`<tr><td>${dateFa(p.pay_date)}</td><td>${money(p.totalAmount)}</td><td>${statusBadge(p.status)}</td></tr>`).join('')))}</div>`;
  }

  async function employeeAttendance() {
    const start=$('#attendance-start')?.value||dateInput(new Date(Date.now()-30*86400000));const end=$('#attendance-end')?.value||dateInput();
    const data=await HRApi.post('/attendance',{startDate:start,endDate:end});const list=Array.isArray(data)?data:[];const today=dateInput();const current=list.find(x=>String(x.workDate).slice(0,10)===today);
    root.innerHTML=pageHeading('حضور و غیاب','ثبت ورود و خروج و مشاهده سوابق ثبت‌شده')+`<section class="panel"><div class="panel-head"><div><h2>وضعیت امروز</h2><p>${dateFa(today)}</p></div>${current?statusBadge(current.status):'<span class="badge info">هنوز ثبت نشده</span>'}</div><div class="attendance-actions"><div class="attendance-action"><h3>ثبت ساعت ورود</h3><p>در بازه زمانی مجاز سازمان، ورود خود را ثبت کنید.</p><form id="checkin-form"><label class="field">یادداشت (اختیاری)<input name="note" maxlength="500" placeholder="مثلاً توضیح تأخیر"></label><div class="form-actions"><button class="btn btn-primary" ${current?'disabled':''}>ثبت ورود</button></div></form></div><div class="attendance-action"><h3>ثبت ساعت خروج</h3><p>پس از پایان ساعت کاری، خروج خود را ثبت کنید.</p><button class="btn btn-secondary" id="checkout-button" ${!current||current.checkOutTime?'disabled':''}>ثبت خروج</button></div></div><p class="field-help">قوانین ساعت مجاز توسط سرور کنترل می‌شوند؛ نتیجه نهایی عملیات در پیام سامانه نمایش داده خواهد شد.</p></section><section class="panel"><div class="panel-head"><h2>تاریخچه حضور و غیاب</h2></div><form id="attendance-filter" class="toolbar"><label class="field">از تاریخ<input id="attendance-start" type="date" value="${esc(start)}"></label><label class="field">تا تاریخ<input id="attendance-end" type="date" value="${esc(end)}"></label><button class="btn btn-primary">اعمال فیلتر</button></form>${table(['تاریخ','ساعت ورود','ساعت خروج','وضعیت','یادداشت'],list.map(a=>`<tr><td>${dateFa(a.workDate)}</td><td>${a.checkInTime?new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'}).format(new Date(a.checkInTime)):'—'}</td><td>${a.checkOutTime?new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'}).format(new Date(a.checkOutTime)):'—'}</td><td>${statusBadge(a.status)}</td><td>${esc(a.note||'—')}</td></tr>`).join(''))}</section>`;
    $('#attendance-filter').addEventListener('submit',e=>{e.preventDefault();employeeAttendance();});
    $('#checkin-form').addEventListener('submit',async e=>{e.preventDefault();const note=String(new FormData(e.currentTarget).get('note')||'').trim();try{await HRApi.post('/attendance/checkin',{note});showToast('ساعت ورود ثبت شد');await employeeAttendance();}catch(err){showError(err);}});
    $('#checkout-button').addEventListener('click',async()=>{try{await HRApi.get('/attendance/checkout');showToast('ساعت خروج ثبت شد');await employeeAttendance();}catch(err){showError(err);}});
  }

  async function employeePayroll() {
    const start=$('#employee-pay-start')?.value||'';const end=$('#employee-pay-end')?.value||'';const params=new URLSearchParams();if(start)params.set('startDate',start);if(end)params.set('endDate',end);
    const data=await HRApi.get(`/employee/payrolle${params.toString()?`?${params}`:''}`);const list=Array.isArray(data)?data:[];
    root.innerHTML=pageHeading('فیش‌های حقوقی من','مشاهده فیش‌های صادرشده برای حساب کاربری شما')+`<section class="panel"><form id="employee-payroll-filter" class="toolbar"><label class="field">از تاریخ<input id="employee-pay-start" type="date" value="${esc(start)}"></label><label class="field">تا تاریخ<input id="employee-pay-end" type="date" value="${esc(end)}"></label><button class="btn btn-primary">اعمال فیلتر</button><button class="btn btn-secondary" type="button" id="employee-pay-clear">پاک کردن</button></form><div class="panel-head"><h2>فهرست فیش‌ها</h2><span class="badge info">${fa(list.length)} فیش</span></div>${table(['شناسه','تاریخ','پایه حقوق','مزایا','کسورات','مبلغ نهایی','وضعیت','جزئیات'],list.map(p=>`<tr><td>${fa(p.id)}</td><td>${dateFa(p.pay_date)}</td><td>${money(p.baseSalary)}</td><td>${money(p.bonuses)}</td><td>${money(p.deduction)}</td><td><b>${money(p.totalAmount)}</b></td><td>${statusBadge(p.status)}</td><td><button class="icon-btn" data-action="payroll-detail" data-id="${p.id}" data-owner="employee">مشاهده</button></td></tr>`).join(''))}</section>`;
    $('#employee-payroll-filter').addEventListener('submit',e=>{e.preventDefault();employeePayroll();});
    $('#employee-pay-clear').addEventListener('click',()=>{$('#employee-pay-start').value='';$('#employee-pay-end').value='';employeePayroll();});
  }
  async function employeeDepartments() {
    const data=await HRApi.get('/employee-data/departments');const list=Array.isArray(data)?data:[];
    root.innerHTML=pageHeading('دپارتمان‌های سازمان','فهرست دپارتمان‌هایی که برای نقش کارمند قابل مشاهده هستند')+`<div class="stats-grid">${list.map(d=>`<article class="stat-card"><span class="stat-icon">▦</span><div><small>دپارتمان ${fa(d.id)}</small><strong style="font-size:15px">${esc(d.name)}</strong></div><button class="icon-btn" data-action="employee-department-detail" data-id="${d.id}">جزئیات</button></article>`).join('')||'<div class="empty-box">دپارتمانی برای نمایش وجود ندارد.</div>'}</div>`;
  }
  async function employeeDepartmentDetail(id) {
    try{const d=await HRApi.get(`/employee-data/departments/${id}`);openModal('جزئیات دپارتمان',`<div class="detail-grid"><div class="detail-item"><small>شناسه</small><b>${fa(d.id)}</b></div><div class="detail-item"><small>نام دپارتمان</small><b>${esc(d.name)}</b></div><div class="detail-item"><small>تاریخ ایجاد</small><b>${dateFa(d.created_at)}</b></div><div class="detail-item" style="grid-column:1/-1"><small>توضیحات</small><b>${esc(d.description||'—')}</b></div></div>`);}catch(e){showError(e);}
  }
  function employeeAccount() {
    root.innerHTML=pageHeading('حساب کاربری','اطلاعاتی که هنگام ورود از سرور دریافت شده است')+`<section class="panel" style="max-width:780px"><div class="panel-head"><h2>اطلاعات حساب</h2><span class="badge success">نشست فعال</span></div><div class="detail-grid"><div class="detail-item"><small>نام و نام خانوادگی</small><b>${esc(user.name||'—')}</b></div><div class="detail-item"><small>شماره موبایل</small><b>${esc(user.phone||'—')}</b></div><div class="detail-item"><small>نقش کاربری</small><b>کارمند</b></div><div class="detail-item"><small>شناسه کاربر</small><b>${fa(user.id)}</b></div><div class="detail-item"><small>شناسه گروه شغلی</small><b>${fa(user.groupId)}</b></div></div><p class="field-help">در بک‌اند فعلی endpoint مشاهده یا ویرایش پروفایل وجود ندارد؛ بنابراین فقط اطلاعات دریافتی از پاسخ ورود نمایش داده می‌شود.</p></section>`;
  }

  document.addEventListener('click', async (event) => {
    const button=event.target.closest('[data-action]');if(!button)return;
    const id=button.dataset.id;const action=button.dataset.action;
    if(action==='department-create')departmentForm();
    if(action==='department-edit'){try{const d=await HRApi.get(`/manager-data/departments/${id}`);departmentForm(d);}catch(e){showError(e);}}
    if(action==='department-detail')departmentDetail(id);
    if(action==='department-delete'){if(!confirm('از حذف این دپارتمان مطمئن هستید؟'))return;try{await HRApi.delete(`/manager-data/departments/${id}`);showToast('دپارتمان حذف شد');await managerDepartments();}catch(e){showError(e);}}
    if(action==='group-edit')editGroup(id);
    if(action==='payroll-detail')payrollDetail(id,button.dataset.owner);
    if(action==='employee-department-detail')employeeDepartmentDetail(id);
  });
  $('#logout-button')?.addEventListener('click',()=>{if(!confirm('از حساب کاربری خارج می‌شوید؟'))return;HRApi.clearSession();location.assign('/login');});
  $('#mobile-menu')?.addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  document.addEventListener('click',e=>{if(window.innerWidth<=760&&!e.target.closest('#sidebar')&&!e.target.closest('#mobile-menu'))$('#sidebar')?.classList.remove('open');});
  boot();
})();
