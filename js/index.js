
  $('#register').hide();
  $('#main').hide();
  $('#toregister').click(
    function () {
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
/*    console.log($('#username').val());
    console.log($('#password').val());
*/    $.ajax({
      type:'POST',
      url:' http://localhost:7474/db/data/cypher',
      contentType: 'application/json',
      data:JSON.stringify({
          "query" : "MATCH (n:Person { username : {username}, password : {password}}) RETURN n",
          "params" : {
           "username" : $('#username').val(),
           "password" : $('#password').val()
          }
        })
      }).done(function(msg){
        if(msg.data.length > 0){
          alert('success');
          $('#login').hide(300);
          $('#main').show(300);
        }
        else
          alert('faliure');
      console.log(msg);
    });
  });

  $('#registerBtn').click(function (event) {
    event.preventDefault();
    $.ajax({
      type:'POST',
      url:' http://localhost:7474/db/data/cypher',
      contentType: 'application/json',
      data:JSON.stringify({
        "query" : "MATCH (n:Person { username : {username}}) RETURN n",
        "params" : {
          "username" : $('#username-register').val(),
        }
      })
    }).done(function(msg){
      if(msg.data.length == 0){
        $.ajax({
          type:'POST',
          url:' http://localhost:7474/db/data/cypher',
          contentType: 'application/json',
          data:JSON.stringify({
              "query" : "CREATE (n:Person { username : {username}, password : {password}, about : {about}, name: {name}, email : {email} }) RETURN n",
              "params" : {
               "username" : $('#username-register').val(),
               "password" : $('#password-register').val(),
               "about" : $('#bio').val(),
               "name": $('#fullname').val(),
               "email" : $('#email').val()
              }
            })
        }).done(function(msg){
                console.log(msg);
                alert('Successfully Registered');
                $('#register').hide(300);
                $('#login').show(300);
        });
      }
      else{
        alert('Username already exists')
      }
    });
});
