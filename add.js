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

window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');

  const form = document.getElementById('addBookForm');
  const titleInput = document.getElementById('bookName');
  const authorInput = document.getElementById('author');
  const categorySelect = document.getElementById('category');
  const statusSelect = document.getElementById('status');
  const tagsInput = document.getElementById('tags');
  const notesInput = document.getElementById('notes');
  const coverInput = document.getElementById('cover');

  let coverData = '';

  // যদি Edit mode
  if(editId){
    const books = loadBooks();
    const book = books.find(b=>b.id===editId);
    if(book){
      titleInput.value = book.title;
      authorInput.value = book.author;
      categorySelect.value = book.category;
      statusSelect.value = book.status;
      tagsInput.value = (book.tags||[]).join(',');
      notesInput.value = book.notes||'';
      coverData = book.cover || '';
    }
  }

  coverInput.addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(file){
      coverData = await new Promise(resolve=>{
        const reader = new FileReader();
        reader.onload = ev => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    }
  });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const books = loadBooks();

    const newBook = {
      id: editId || crypto.randomUUID(),
      title: titleInput.value.trim(),
      author: authorInput.value.trim(),
      category: categorySelect.value,
      status: statusSelect.value,
      tags: tagsInput.value.split(',').map(t=>t.trim()).filter(Boolean),
      notes: notesInput.value.trim(),
      cover: coverData,
      year: new Date().getFullYear()
    };

    if(editId){
      // Update existing
      const index = books.findIndex(b=>b.id===editId);
      if(index!==-1) books[index] = newBook;
    } else {
      books.push(newBook);
    }

    saveBooks(books);
    // alert লাইনটি বাদ দেওয়া হয়েছে
    window.location.href = './index.html';
  });
});
