function ViewModel (errors) {
  this.model = {
    id: 'documentUpload',
    name: 'document',
    label: {
      text: 'Choose file',
      classes: 'govuk-visually-hidden'
    }
  }

  if (errors) {
    this.model.errorMessage = {
      text: errors.details[0].message
    }
  }
}

module.exports = ViewModel
