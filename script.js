const LS_KEY = 'bookLibrary_v1';

function loadBooks(){ 
  try{ 
    const raw = localStorage.getItem(LS_KEY); 
    if(!raw) return [];   
    return JSON.parse(raw); 
  }catch(e){ 
    return []; 
  } 
}

function saveBooks(data){ 
  localStorage.setItem(LS_KEY, JSON.stringify(data)); 
}

let books = loadBooks();

const state={q:'',category:'all',status:'all',sortBy:'title-asc'};
const grid=document.getElementById('grid'),
      emptyState=document.getElementById('emptyState'),
      countEl=document.getElementById('bookCount'),
      searchInput=document.getElementById('searchInput'),
      categoryFilter=document.getElementById('categoryFilter'),
      statusFilter=document.getElementById('statusFilter'),
      sortByEl=document.getElementById('sortBy'),
      chipGroup=document.getElementById('chipGroup');

function refreshCategoryOptions(){
  const cats = Array.from(new Set(books.map(b=>b.category))).sort((a,b)=>a.localeCompare(b));
  categoryFilter.innerHTML = '<option value="all">সব</option>' + cats.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function render(){
  let rows = books.filter(b=>{
    const q = state.q.trim().toLowerCase();
    const matchesQ = !q || [b.title,b.author, ...(b.tags||[])].join(' ').toLowerCase().includes(q);
    const matchesCat = state.category==='all' || b.category===state.category;
    const matchesStatus = state.status==='all' || b.status===state.status;
    return matchesQ && matchesCat && matchesStatus;
  });

  const collator = new Intl.Collator('bn-BD');
  rows.sort((a,b)=>{
    switch(state.sortBy){
      case 'title-asc': return collator.compare(a.title, b.title);
      case 'title-desc': return collator.compare(b.title, a.title);
      case 'author-asc': return collator.compare(a.author, b.author);
      case 'author-desc': return collator.compare(b.author, a.author);
      case 'year-asc': return a.year - b.year;
      case 'year-desc': return b.year - a.year;
      default: return 0;
    }
  });

  grid.innerHTML = rows.map(b=>cardHtml(b)).join('');
  countEl.textContent = String(rows.length);

  const hasRows = rows.length>0;
  grid.style.display = hasRows ? 'grid' : 'none';
  emptyState.style.display = hasRows ? 'none':'block';

  grid.querySelectorAll('[data-action="edit"]').forEach(btn=>btn.addEventListener('click', ()=>onEdit(btn.dataset.id)));
  grid.querySelectorAll('[data-action="delete"]').forEach(btn=>btn.addEventListener('click', ()=>onDelete(btn.dataset.id)));
}

function cardHtml(b){ 
  return `
  <div class="card">
    <div class="cover">
      ${b.cover ? `<img src="${b.cover}" alt="${escapeHtml(b.title)}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;">` : `<div class="placeholder">📖</div>`}
      <div class="badge">${escapeHtml(b.category)}</div>
    </div>
    <div class="content">
      <div class="title">${escapeHtml(b.title)}</div>
      <div class="meta">${escapeHtml(b.author)} | ${b.year} <span class="status ${b.status}">${b.status}</span></div>
      ${b.tags?.length ? `<div class="tags">${b.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
    </div>
    <div class="card-actions">
      <button class="icon-btn" data-action="edit" data-id="${b.id}" title="Edit">✏️</button>
      <button class="icon-btn" data-action="delete" data-id="${b.id}" title="Delete">🗑️</button>
    </div>
  </div>
  `;
}

function escapeHtml(s){ 
  return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); 
}

searchInput.addEventListener('input', e=>{ state.q=e.target.value; render(); });
categoryFilter.addEventListener('change', e=>{ state.category=e.target.value; render(); });
statusFilter.addEventListener('change', e=>{ state.status=e.target.value; render(); });
sortByEl.addEventListener('change', e=>{ state.sortBy=e.target.value; render(); });

if (chipGroup) {
  chipGroup.querySelectorAll('.chip').forEach(chip=>chip.addEventListener('click', ()=>{
    searchInput.value = chip.dataset.chip; 
    state.q=chip.dataset.chip; 
    render(); 
  }));
}

function onEdit(id){
  const book = books.find(b => b.id === id);
  if(!book) return alert("বই পাওয়া যায়নি!");

  const query = new URLSearchParams();
  query.set('id', book.id);
  query.set('title', book.title);
  query.set('author', book.author);
  query.set('category', book.category);
  query.set('status', book.status);
  query.set('tags', book.tags.join(','));
  query.set('notes', book.notes || '');
  if(book.cover) query.set('cover', book.cover);

  location.href = `add.html?${query.toString()}`;
}

function onDelete(id){ 
  books = books.filter(b=>b.id!==id); 
  saveBooks(books); 
  refreshCategoryOptions(); 
  render(); 
}

refreshCategoryOptions();
render();
