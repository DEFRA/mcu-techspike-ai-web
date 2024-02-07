const upload = {
  routes: {
    document: {
      get: '/upload',
      post: '/upload',
      redirectToDocument: '/document',
      redirectToGenerateDocument: '/generate-document',
      redirectToPlayground: '/playground',
      redirectToPersona: '/persona'
    }
  },
  views: {
    document: 'upload-document'
  }
}

module.exports = upload
