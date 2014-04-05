
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
          "query" : 'MATCH (n) where n.name =~ {term} RETURN n,labels(n) LIMIT 20',
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
    return $( "<li><a><p class='auto-left'>"+item[1][0]+":</p><p class='auto-center'>"+item[0]['data']['name']+"</p></a></li>" ).appendTo( ul );
  };


  $( ".name-search" ).bind( "autocompleteselect", function( event, ui ) {
    //console.log("selected");
    console.log(ui);
    $('#movie-title').html(ui['item'][0]['data']['name']+'('+ui['item'][0]['data']['year']+')')
    if(ui['item'][1][0] == 'Movie'){
      $('#like-movie').prop('disabled', false);
      //if(ui['item'][0]['data']['poster'] != '')
        $('#movie-image').attr('src',ui['item'][0]['data']['poster'])
      //else
      //  $('#movie-image').attr('src',"http://placehold.it/150")
      $('#storyline').html(ui['item'][0]['data']['storyline'])
      $('#rating').html(ui['item'][0]['data']['rating'])
    
    $('#movie-modal').modal('show');

    $.ajax({
      type:'POST',
      url:' http://localhost:7474/db/data/cypher',
      contentType: 'application/json',
      data:JSON.stringify({
        "query" : "MATCH (n)-[r]-(m:Movie {name: {name}}) RETURN n,labels(n)",
        "params" : {
          "name" : ui['item'][0]['data']['name']
        }
      })
    }).done(function(msg){
      console.log(msg);
      var i=0;
      genres="";
      actors="";
      director= "";
      for(i=0;i<msg['data'].length;i++){
        if(msg['data'][i][1][0]=='Genre')
          genres += msg['data'][i][0]['data']['name']+"| ";
        else if(msg['data'][i][1][0] == 'Actor')
          actors += msg['data'][i][0]['data']['name']+", "
        else if(msg['data'][i][1][0] == 'Director')
          director = msg['data'][i][0]['data']['name']
      } 
      actors = actors.substring(0, actors.length - 2);
      genres = genres.substring(0, genres.length - 2);
      $('#actors').html(actors);
      $('#director').html(director);
      $('#movie-title').append("<span class='right'>"+genres+"</span>");
    });

      $.ajax({
        type:'POST',
        url:' http://localhost:7474/db/data/cypher',
        contentType: 'application/json',
        data:JSON.stringify({
          "query" : "MATCH (p:Person {username:{personname}})-[r:LIKES]-(m:Movie {name: {moviename}}) Return r",
          "params" : {
            "personname" : $('#username').val(),
            "moviename" : ui['item'][0]['data']['name']
          }
        })
      }).done( function(msg){
          console.log(msg);
          if(msg['data'].length != 0){
            $('#like-movie').prop('disabled', true);
          }
          else{
            $('#like-movie').on('click', function(e){
              $.ajax({
                type:'POST',
                url:' http://localhost:7474/db/data/cypher',
                contentType: 'application/json',
                data:JSON.stringify({
                "query" : "MATCH (p:Person {username:{personname}}), (m:Movie {name: {moviename}}) CREATE (p)-[r:LIKES]->(m)",
                "params" : {
                  "personname" : $('#username').val(),
                  "moviename" : ui['item'][0]['data']['name']
                }
              })
            }).done( function(msg){
              console.log(msg);
              $('#like-movie').prop('disabled', true);
              alert('liked');
            });
          });
        }
      });
    }

    else if(ui['item'][1][0] == 'Actor'){
      $('#like-actor').prop('disabled', false);
      $('#actor-title').html(ui['item'][0]['data']['name']);
      $('#actor-image').attr('src',ui['item'][0]['data']['photo']);
      $('#imdb-link').html("<a href='"+ui['item'][0]['data']['imdblink']+"'>"+ui['item'][0]['data']['imdblink']+"</a>");
      $('#actor-modal').modal('show');
      var movies = "";
      $.ajax({
        type:'POST',
        url:' http://localhost:7474/db/data/cypher',
        contentType: 'application/json',
        data:JSON.stringify({
          "query" : "MATCH (a:Actor {name:{name}})-[r:Acted]-(m:Movie) return m",
          "params" : {
          "name" : ui['item'][0]['data']['name']
        }
      })
    }).done(function(msg){

      var i=0;
      for(i=0;i<msg['data'].length;i++){
        movies += msg['data'][i][0]['data']['name']+"("+msg['data'][i][0]['data']['year']+")"+"<br>"
      }
      $('#actor-movies').html(movies);
    });

      $.ajax({
        type:'POST',
        url:' http://localhost:7474/db/data/cypher',
        contentType: 'application/json',
        data:JSON.stringify({
          "query" : "MATCH (p:Person {username:{personname}})-[r:LIKES]-(m:Actor {name: {actorname}}) Return r",
          "params" : {
            "personname" : $('#username').val(),
            "actorname" : ui['item'][0]['data']['name']
          }
        })
      }).done( function(msg){
          //console.log(msg);
          if(msg['data'].length != 0){
            $('#like-actor').prop('disabled', true);
          }
          else{
            $('#like-actor').on('click', function(e){
              $.ajax({
                type:'POST',
                url:' http://localhost:7474/db/data/cypher',
                contentType: 'application/json',
                data:JSON.stringify({
                "query" : "MATCH (p:Person {username:{personname}}), (m:Actor {name: {actorname}}) CREATE (p)-[r:LIKES]->(m)",
                "params" : {
                  "personname" : $('#username').val(),
                  "actorname" : ui['item'][0]['data']['name']
                }
              })
            }).done( function(msg){
              console.log(msg);
              $('#like-actor').prop('disabled', true);
              alert('liked');
            });
          });
        }
      });
  }


  else if(ui['item'][1][0] == 'Director' | ui['item'][1][0] == 'Genre'){
    $('#like-director').prop('disabled', false);
    $('#director-title').html(ui['item'][0]['data']['name']);
    $('#director-modal').modal('show');
      var movies = "";
      $.ajax({
        type:'POST',
        url:' http://localhost:7474/db/data/cypher',
        contentType: 'application/json',
        data:JSON.stringify({
          "query" : "MATCH (a:"+ui['item'][1][0]+" {name:{name}})-[r]-(m:Movie) return m",
          "params" : {
          "name" : ui['item'][0]['data']['name']
        }
      })
    }).done(function(msg){

      var i=0;
      for(i=0;i<msg['data'].length;i++){
        movies += msg['data'][i][0]['data']['name']+"("+msg['data'][i][0]['data']['year']+")"+"<br>"
      }
      $('#director-movies').html(movies);
    });

    $.ajax({
        type:'POST',
        url:' http://localhost:7474/db/data/cypher',
        contentType: 'application/json',
        data:JSON.stringify({
          "query" : "MATCH (p:Person {username:{personname}})-[r:LIKES]-(m:"+ui['item'][1][0]+" {name: {name}}) Return r",
          "params" : {
            "personname" : $('#username').val(),
            "name" : ui['item'][0]['data']['name']
          }
        })
      }).done( function(msg){
          //console.log(msg);
          if(msg['data'].length != 0){
            $('#like-director').prop('disabled', true);
          }
          else{
            $('#like-director').on('click', function(e){
              $.ajax({
                type:'POST',
                url:' http://localhost:7474/db/data/cypher',
                contentType: 'application/json',
                data:JSON.stringify({
                "query" : "MATCH (p:Person {username:{personname}}), (m:"+ui['item'][1][0]+" {name: {name}}) CREATE (p)-[r:LIKES]->(m)",
                "params" : {
                  "personname" : $('#username').val(),
                  "name" : ui['item'][0]['data']['name']
                }
              })
            }).done( function(msg){
              console.log(msg);
              $('#like-director').prop('disabled', true);
              alert('liked');
            });
          });
        }
      });




  }
});

$('#movie-modal').on('hidden.bs.modal', function () {
  $('#like-movie').off('click');
  console.log('hidden');
});

$('#actor-modal').on('hidden.bs.modal', function () {
  $('#like-actor').off('click');
  console.log('hidden');
});

$('#director-modal').on('hidden.bs.modal', function () {
  $('#like-director').off('click');
  console.log('hidden');
});