
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

$('#rec-movie').click(function(e){
  console.log('modal')
  $('#modal1').modal('show');
});

$( ".name-search" ).autocomplete({
  source: function( request, respond ){
    $.ajax({
      type:'POST',
      url:' http://localhost:7474/db/data/cypher',
      contentType: 'application/json',
      data:JSON.stringify({
          "query" : 'MATCH (n) where n.name =~ {term} RETURN n',
          "params" : {
           "term" : "(?i).*"+request.term+".*"
          }
        })
    }).done(function(msg){
      //console.log(msg);
      respond(msg.data);
    })
  }
  }).data("ui-autocomplete")._renderItem = function( ul, item ) {
    console.log(item);
    return $( "<li><a>"+item[0]['data']['name']+"</a></li>" ).appendTo( ul );
  };


  $( ".name-search" ).bind( "autocompleteselect", function( event, ui ) {
    //console.log("selected");
    $('#modal1').modal('show');
  });