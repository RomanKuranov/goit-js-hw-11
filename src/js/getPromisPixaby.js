import axios from 'axios';

const URL = 'https://pixabay.com/api';
const KEY = '33959341-6efa6538fb819d482b32dfdfa';
const OPTIONS = 'image_type=photo&orientation=horizontal&safesearch=true';

export default class PixabayApiService {
  constructor() {
    this.query = '';
    this.page = 1;
    this.per_page = 40;
  }

  async getImage() {
    try {
      const res = await axios.get(
        `${URL}/?key=${KEY}&q=${this.query}&${OPTIONS}&per_page=${this.per_page}&page=${this.page}`
      );

      this.nextPage();
      return res.data;
    } catch (error) {
      console.log(error.message);
    }
  }

  nextPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}