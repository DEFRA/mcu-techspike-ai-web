const upload = {
  routes: {
    document: {
      get: '/upload',
      post: '/upload',
      redirect: '/document'
    }
  },
  views: {
    document: 'upload/upload-document'
  }
}

module.exports = upload
