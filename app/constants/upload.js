const upload = {
  routes: {
    document: {
      get: '/upload',
      post: '/upload',
      redirectToDocument: '/document',
      redirectToPlayground: '/playground'
    }
  },
  views: {
    document: 'upload-document'
  }
}

module.exports = upload
