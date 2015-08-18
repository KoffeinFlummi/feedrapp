// 3rd-party modules
import webPockets from 'web-pockets';

// Local modules
import Feed from './feed';

export default class Server {
  constructor () {
    this.app = webPockets();

    this.bindRoutes();
  }

  listen (port, iface, callback) {
    return this.app.listen(port, iface, callback);
  }

  bindRoutes () {
    this.app.request.value('feedUrl', (queryParams) => {
      return queryParams.feedUrl;
    });

    this.app.request.value('feed', (feedUrl) => {
      if (feedUrl) {
        return new Feed(feedUrl).read();
      } else {
        return {
          statusCode: 400,
          body: {
            message: 'No feedUrl param found!',
            details: 'Please add a query parameter to the request URL which points to a feed!'
          }
        };
      }
    });

    this.app.route('GET /', (queryParams, feed) => {
      if (queryParams.callback) {
        let body = { responseStatus: 200, responseDetails: null, responseData: { feed } };

        return {
          headers: {
            'content-type': 'text/javascript; charset=utf-8'
          },
          body: `${queryParams.callback}(${JSON.stringify(body)});`
        };
      } else {
        return feed;
      }
    });
  }
}
