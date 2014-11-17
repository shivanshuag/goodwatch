
  $('#register').hide();
  $('#toregister').click(
    function () {
        console.log('register')
      $('#login').hide(300);
      $('#register').show(300);
    }
  );
  $('#tologin').click(
    function () {
      $('#register').hide(300);
      $('#login').show(300);
    }
  );

  $('#loginBtn').click(function (event){
   $.ajax({
      type:'POST',
      url:'api/login',
      contentType: 'application/json',
      data:JSON.stringify({
           "username" : $('#username').val(),
           "password" : $('#password').val()
        })
      }).done(function(msg){
            if(msg == 'error'){
                alert('failure');
            }
            else {
                window.location = 'index.html'
            }
      console.log(msg);
    });
  });

  $('#registerBtn').click(function (event) {
    event.preventDefault();
    $.ajax({
      type:'POST',
      url:'api/register',
      contentType: 'application/json',
      data:JSON.stringify({
        "username" : $('#username-register').val(),
        "password": $('#password-register').val(),
        "about": $('#bio').val(),
        "name": $('#fullname').val(),
        "email": $('#email').val()
      })
    }).done(function(msg){
        console.log(msg);
        alert(msg);
    });
});
