// 3rd-party modules
import fastFeed from 'fast-feed';

// Local modules
import { getResource } from './helper';

export default class Feed {
  constructor (url) {
    this.url = url;
  }

  read () {
    return getResource(this.url).then((res) => {
      return new Promise((resolve, reject) => {
        fastFeed.parse(res.data, { extensions: true }, (err, feed) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(feed);
          }
        });
      });
    }).then((feed) => {
      return this.format(feed);
    });
  }

  format (data) {
    return {
      feedUrl: this.url,
      title: data.title,
      link: data.link,
      description: data.subtitle || data.description || '',
      author: data.author || '',
      entries: data.items.map((item) => this.formatItem(item))
    };
  }

  formatItem (item) {
    let result = {
      title: item.title,
      link: item.link,
      content: item.content || item.summary || item.description || '',
      publishedDate: item.published || item.pubDate || item.date,
      categories: [],
      author: item.author || this.extractCreator(item)
    };

    result.contentSnippet = result.content.replace(/(<([^>]+)>)/ig, '').substring(0, 120);

    return result;
  }

  extractCreator (item) {
    if (item.extensions) {
      let extension = item.extensions.find((extension) => {
        return extension.name === 'dc:creator';
      });

      return (extension || {}).value;
    }
  }
}
