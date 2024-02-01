module.exports = [{
  method: 'POST',
  path: '/prompt',
  options: {
    handler: (request, h) => {
      const name = request.payload.name
      const persona = request.payload.persona
      const version = request.payload.version
      console.log(request.payload)
      return h.redirect('playground?name=' + name + '&persona=' + persona + '&version=' + version)
    }
  }
}]
