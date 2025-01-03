$(document).ready(function () {
  $('#modActionCloseButton').on('click', () => {
    // Send request out.
    var formElement = document.querySelector('#modactionform');
    var bodyFormData = new FormData(formElement);

    const banData = {};
    for (var [key, value] of bodyFormData.entries()) {
      banData[key] = value;
    }

    Swal.fire({
      title: 'Sending your request...',
      onOpen: () => {
        Swal.showLoading();

        axios({
          method: 'POST',
          url: '/mod/ban',
          data: banData,
          config: { headers: { 'Content-Type': 'application/json' } },
        })
          .then(function(response) {
            //handle success
            // console.log(response);

            $('#modModal').modal('hide');

            // Clear the form for next input.
            $('#modactionform')[0].reset();

            Swal.close();
            Swal.fire({
              title: response.data,
              type: 'success',
            });
          })
          .catch(function(err) {
            Swal.close();
            Swal.fire({
              title: err.response.data,
              type: 'error',
            });
          });
      },
    });
  });
});