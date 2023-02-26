
import Notiflix from 'notiflix';
import PixabayApiService from './getPromisPixaby.js';
import LoadMoreBtn from './LoadMoreBtn.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

//*=========== створюємо екземпляр класу ==============
const pixabayApiService = new PixabayApiService();
const loadMoreBtn = new LoadMoreBtn({ selector: '.load-more', isHidden: true });

//*=========== слухачі ==============
form.addEventListener('submit', onSubmit);
loadMoreBtn.button.addEventListener('click', fetchArticles);

//*=========== сабміт ==============
function onSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const value = form.elements.searchQuery.value.trim();

  pixabayApiService.resetPage();
  clearNewList();
  loadMoreBtn.show();

  pixabayApiService.query = value;

  fetchArticles().finally(() => form.reset());
}

//*=========== кнопка => добавити ще об'єктів на сторінку ==============
async function fetchArticles() {
  loadMoreBtn.disable();

  try {
    const data = await pixabayApiService.getImage();
    // деструктуризуємо з data
    const { hits, totalHits } = data;
    // або
    // const hits = data.hits;
    // const totalHits = data.totalHits;

    if (hits.length === 0) throw new Error(onNothingFound());

    const markup = hits.reduce(
      (markup, hits) => createMarkup(hits) + markup,
      ''
    );
    appendNewToList(markup);

    let page = pixabayApiService.page - 1;
    let limitPerPage = pixabayApiService.per_page;
    if (pixabayApiService.page - 1 === 1) onInfo(totalHits);
    const totalPages = totalHits / limitPerPage;

    if (page > totalPages) throw new Error(onNoMore());

    loadMoreBtn.enable();
  } catch (err) {
    return err;
  }
}

//*=========== функції помилок ==============
function onNothingFound(err) {
  loadMoreBtn.hide();
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function onNoMore() {
  loadMoreBtn.hide();
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results."
  );
}
//*=========== повідомлення ==============
function onInfo(info) {
  Notiflix.Notify.success(`Hooray! We found ${info} images.`);
}

//*=========== очищаємо розмітку на сторінці ==============
function clearNewList(markup) {
  gallery.innerHTML = '';
}
//*=========== пушимо розмітку на сторінку + Бібліотека SimpleLightbox ==============
// цю функцію передає в onError(err) appendNewToList("текст повідомлення")
function appendNewToList(markup) {
  gallery.insertAdjacentHTML('beforeend', markup);

  new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
    enableKeyboard: true,
  }).refresh();
}

//*=========== Шаблон розмітки картки одного зображення для галереї ==============
function createMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
  <div class="photo-card">
    <div class="images">
    <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy"  /></a>
    </div>
    <div class="info">
    <p class="info-item">
      <b><span class="span">Likes:</span></b>
      <b>${likes}</b>
    </p>
    <p class="info-item">
      <b><span class="span">Views:</span></b>
      <b>${views}</b>
    </p>
    <p class="info-item">
      <b><span class="span">Comments:</span></b>
      <b>${comments}</b>
    </p>
    <p class="info-item">
      <b><span class="span">Downloads:</span></b>
      <b>${downloads}</b>
    </p>
  </div>
</div>`;
}